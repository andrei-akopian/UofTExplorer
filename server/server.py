"""
CSC111 Winter 2026 Project 2: ArtSci Atlas

SERVER
This Python module connects to the frontend and contains functions that are related to visualizations.
Flask is used to connect the Python functions to JavaScript.

Copyright (c) 2026 Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng
This file was written with the help of ChatGPT codex GPT-5.4.
"""

import socket
import json
import os
from typing import Any
from flask import (
    Flask,
    Response,
    request,
    jsonify,
    render_template,
    send_from_directory,
)
from flask.typing import ResponseReturnValue

from core import sat
from core.constructor import construct_container, construct_subgraph
from core.algorithms import (
    get_course_suggestions,
    get_filtered_graph,
    get_search_suggestions,
    traversers,
)
from core.deconstructor import deconstruct_course_graph

app = Flask(__name__, static_folder="../frontend/dist")

DATA_FOLDER = "./data"
COURSE_GRAPH_CONTAINER = construct_container(
    f"{DATA_FOLDER}/courses.json",
    f"{DATA_FOLDER}/programs.json",
    f"{DATA_FOLDER}/glossary.json",
    f"{DATA_FOLDER}/breadths.json",
)

# Progress tracking for long-running requests
PROGRESS_TRACKER = {}
TICKETS: dict[str, dict[str, Any]] = {}

MAX_RESULTS = {"departments": 20, "programs": 4, "courses": 36}


def get_global_statistics_from_file() -> dict[str, int | float]:
    """
    Load precomputed global statistics from data/global_statistics.json.
    Used by /globalstats endpoint to reender tempalte for the globalstats.html page.
    """
    stats_path = f"{DATA_FOLDER}/global_statistics.json"
    with open(stats_path, "r", encoding="utf-8") as file:
        return json.load(file)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    app.logger.info("Serving React Content")

    # If the user requests an actual file inside the static folder, serve it
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)

    # Otherwise, return index.html to let React Router handle client-side routing
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/ticket/<ticket_id>", methods=["GET"])
def get_ticket(ticket_id: str) -> ResponseReturnValue:
    """
    Endpoint to retrieve a specific ticket by its ID.
    """
    ticket = TICKETS.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404
    return jsonify(ticket)


@app.route("/api/pathfind", methods=["POST"])
def pathfind() -> ResponseReturnValue:
    """
    Endpoint for the path explorer page request payload.
    Runs the Z3 SAT solver and returns the result.
    """
    try:
        request_data = request.get_json(silent=True) or {}
        completed_courses = request_data.get("completed", [])
        desired_courses = request_data.get("desired", [])
        avoided_courses = request_data.get("avoided", [])

        app.logger.info(
            "Received path explorer request: completed=%s desired=%s avoided=%s",
            completed_courses,
            desired_courses,
            avoided_courses,
        )

        solution = sat.solve_satz3(
            COURSE_GRAPH_CONTAINER.graph,
            desired_courses,
            completed_courses,
            avoided_courses,
        )

        solution_selection = {
            course: COURSE_GRAPH_CONTAINER.graph.courses[course]
            for course in solution
            if course not in desired_courses
        }
        target_selection = {
            tar: COURSE_GRAPH_CONTAINER.graph.courses[tar] for tar in desired_courses
        }
        origins = set(desired_courses)

        subgraph = construct_subgraph(
            COURSE_GRAPH_CONTAINER.graph,
            list(origins),
            traversers.Targets(True, True, False, False),
        )
        graph_data = deconstruct_course_graph(
            subgraph, solution_selection, target_selection
        )

        return jsonify({"solution": solution, "graph_data": graph_data}), 200

        # ticket_id = str(uuid.uuid4())

        # TICKETS[ticket_id] = {
        #     "cancelled": False,
        #     "result": None,
        #     "error": None
        # }

        # solver_thread = threading.Thread(
        #     target=_pathfind,
        #     args=(ticket_id, completed_courses, desired_courses, avoided_courses),
        #     daemon=True
        # )
        # solver_thread.start()
        # return jsonify({"ticket_id": ticket_id}), 202

    except Exception as e:
        app.logger.warning(e)
        return jsonify({"error": str(e)}), 500


def _pathfind(
    ticket_id: str,
    completed_courses: list[str],
    desired_courses: list[str],
    avoided_courses: list[str],
) -> None:
    """
    Background worker function that runs the Z3 SAT solver and stores results in TICKETS.
    """
    try:
        solver = sat.solve_satz3(
            COURSE_GRAPH_CONTAINER.graph,
            desired_courses,
            completed_courses,
            avoided_courses,
        )
        solution = next(solver)
        TICKETS[ticket_id]["result"] = solution
    except Exception as e:
        app.logger.warning(e)
        TICKETS[ticket_id]["error"] = str(e)


@app.route("/api/get_immediate_postreqs", methods=["POST"])
def get_immediate_postreqs() -> ResponseReturnValue:
    """
    Return a deconstructed graph showing immediate post-requisites for completed courses.
    """
    try:
        request_data = request.get_json(silent=True) or {}
        completed_courses = request_data.get("completed_courses", [])

        if not completed_courses:
            return jsonify({"error": "No completed courses provided"}), 400

        app.logger.info(
            "Processing immediate postreqs request for courses: %s", completed_courses
        )

        # Build origins set with completed courses
        origins = {
            x: COURSE_GRAPH_CONTAINER.graph.courses[x] for x in completed_courses
        }

        # Construct subgraph with completed courses
        postreqs = COURSE_GRAPH_CONTAINER.graph.get_satisfied_courses(
            list(origins.values())
        )
        subgraph = construct_subgraph(
            COURSE_GRAPH_CONTAINER.graph,
            list(postreqs.keys()),
            traversers.Targets(True, True, False, False),
        )

        # Create selections for deconstruction
        solution_selection = postreqs.copy()
        target_selection = origins.copy()

        # Deconstruct the graph
        graph_data = deconstruct_course_graph(
            subgraph, solution_selection, target_selection
        )

        # Add display text for target courses (completed courses)
        solution_display = {
            code: f"{code}: {course.data.title}"
            for code, course in solution_selection.items()
        }
        graph_data["solution_display"] = solution_display

        return jsonify(graph_data), 200

    except Exception as e:
        app.logger.warning("Error in get_immediate_postreqs: %s", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/suggest", methods=["POST"])
def suggest() -> ResponseReturnValue:
    """
    Return search suggestions for the current query, including departments, programs, and courses.
    """
    try:
        data = request.get_json()
        query = (data or {}).get("q", "").strip().upper()

        if not query or len(query) < 2:
            return jsonify({"results": []})

        matches = get_search_suggestions(COURSE_GRAPH_CONTAINER, query, MAX_RESULTS)

        return jsonify({"results": matches})

    except Exception as e:
        return (
            jsonify({"results": [], "error": "Internal error", "exception": str(e)}),
            500,
        )


@app.route("/api/suggest_courses", methods=["POST"])
def suggest_courses() -> ResponseReturnValue:
    """
    Return search suggestions for the current query, including only courses.
    """
    try:
        data = request.get_json()
        query = (data or {}).get("q", "").strip().upper()

        if not query or len(query) < 2:
            return jsonify({"results": []})

        matches = get_course_suggestions(COURSE_GRAPH_CONTAINER, query)[
            : MAX_RESULTS["courses"]
        ]

        return jsonify({"results": matches})

    except Exception as e:
        return jsonify({"results": [], "error": "Internal error"}), 500


@app.route("/api/courseinformation", methods=["POST"])
def courseinformation() -> ResponseReturnValue:
    """
    Return all information about a course, to be displayed in the sidebar.
    """
    try:
        data = request.get_json(silent=True) or {}
        query = data.get("course", "").strip().upper()
        app.logger.info("Course information request for %s", query)

        info = COURSE_GRAPH_CONTAINER.get_information(query)

        if info == {"results": [], "error": "Invalid Course Code"}:
            return jsonify(info), 500
        else:
            return jsonify(info), 200

    except Exception as e:
        app.logger.warning(e)
        return jsonify({"results": [], "error": "Internal error"}), 500


@app.route("/api/fetch_graph", methods=["POST"])
def fetch_graph() -> ResponseReturnValue:
    """
    Respond to a request to fetch a new graph.
    Return a json structure of the graph.
    """
    try:
        request_data = request.get_json(silent=True)
        app.logger.info("Processing fetch_graph request for %s", request_data)
        # Courtesy of Grok.com

        # === BAD INPUT HANDLING ===
        if not request_data or "query" not in request_data:
            return (
                jsonify(
                    {
                        "error": "Bad request: 'query' field is required in the JSON body."
                    }
                ),
                400,
            )

        # Get the search query
        query: str = str(request_data["query"]).strip()

        # Get the chosen filters
        filters = {
            "cr_ncr": request_data["cr_ncr"],
            "departments": request_data["departments"],
            "breadth": request_data["breadth_requirements"],
        }
        print(
            f"Processing Query for {query}, {filters['cr_ncr']}, {filters['departments']}, {filters['breadth']}"
        )

        if not query:
            return jsonify({"error": "Query cannot be empty."}), 400

        graph_data = graph_for_query(query, filters)
        should_open_course_panel = graph_data["curr_query"]["type"] == "course"
        return (
            jsonify(
                {**graph_data, "should_open_course_panel": should_open_course_panel}
            ),
            200,
        )

    except Exception as e:
        # Generic server error
        print(e)
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


def graph_for_query(
    query: str, filters: dict[str, Any] = None
) -> dict[str, list | str]:
    """
    Get graph data corresponding to a specific query, case-insensitive, given filters.
    Graph data already contains curr_query and search fields.

    Preconditions:
        - query is already formatted (no further edits needed, other than query.upper() or query.lower())
    """
    print(COURSE_GRAPH_CONTAINER)
    if filters is None:
        filters = {"cr_ncr": [], "departments": [], "breadth": []}

    filtered_graph = get_filtered_graph(COURSE_GRAPH_CONTAINER, query, filters)

    return filtered_graph


@app.route("/api/departments", methods=["GET"])
def get_departments() -> ResponseReturnValue:
    """
    Respond to a request to fetch all departments.
    Return a json structure of the departments.
    """
    try:
        departments = COURSE_GRAPH_CONTAINER.departments
        return jsonify(departments), 200
    except Exception as e:
        app.logger.warning(e)
        return jsonify({"error": "Internal error"}), 500


@app.route("/api/stats", methods=["GET"])
def get_stats() -> ResponseReturnValue:
    """
    Respond to a request to fetch global stats.
    Return a json structure of the departments.
    """
    try:
        return jsonify(get_global_statistics_from_file()), 200
    except Exception as e:
        app.logger.warning(e)
        return jsonify({"error": "Internal error"}), 500


def find_port() -> int:
    """
    Find an open port for the Flask server to use.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", 5000))
            return 5000
        except OSError:
            s.bind(("127.0.0.1", 0))
            return s.getsockname()[1]


def start_server(host="127.0.0.1") -> None:
    """
    Start the Flask server on an open port, and print the URL to access it.
    """
    port = find_port()
    print(flush=True)
    print(f"http://{host}:{port}/")
    app.run(debug=True, host=host, port=port)


if __name__ == "__main__":
    start_server()
