# Artsci Atlas

Ideas
- [ ] scrape ttb and user for filtering and class sizes
- [ ] make better 2d graph untanglement algorithm

---

### Other

- [Academic Calendar - Search Courses](https://artsci.calendar.utoronto.ca/search-courses)
- [Academic Calendar - Search Programs](https://artsci.calendar.utoronto.ca/search-programs)
- [Academic Calendar - Courses - Printer Friendly](https://artsci.calendar.utoronto.ca/print/view/pdf/course_search/print_page/debug?page=178)

## To-Do

### Phase 0: Parsing + Construction

- [x] Scrape + parse courses and programs from Academic Calendar
- [x] Define custom data structures 
- [x] Construct graph of all courses

### Phase 1: Simple Starter Stuff

- [x] Write functions that check for satisfiability of requisites
- [x] Create generator functions that searches through the graph
- [x] Create deconstructor function that turns graph into json for future visualizations
- [x] Create simple visualizer: type in a course code, display a tree of every prerequisite/postrequisite for that course

### Phase 2: Algorithms

- [x] Given a CourseGraph:
  - [x] number of courses, requisites
    - [x] total number
    - [x] breadth category
    - [ ] ~~hours~~
    - [x] cr/ncr
    - [x] department
  - [x] openness for
    - [x] other courses
    - [x] programs

Satisfiability:
- [x] Given a list of courses:
  - [x] Given also a new course, return whether the new course can be taken (take into account exclusions)
  - [x] Return a list of all courses that can be taken

- [ ] Given a course:
  - [x] Show every single course in the graph that is underneath this course (somehow part of a prerequisite)
  - [ ] Determine the shortest path to taking that course

- [ ] Given a CourseGraph:
  - idk yet

- [ ] ~~Optimize `Requisite.add_requisite` for larger insertions, perhaps by making a bulk add method~~
- [ ] Data Analysis Algorithms for Phase 4

### Phase 3: Visualizations

- [x] Entire graph
  - [x] Visualize entire graph
  - [x] Optimize visualized graph (by department)
  - [x] Display course and requisite information
  - [x] Display graph of programs
  - [x] Optimize searching algorithm to search through all information (courses and programs)
- [ ] Specific courses
  - [x] Type in a course code, display a tree of every prerequisite/postrequisite for that course
  - [x] Filter courses by department, breadth, hours, CR/NCR eligibility, etc. (e.g. choose a department, show all courses in that department)
  - [ ] Type in/select a list of courses already taken, and see which courses can now be taken
  - [ ] Type in/select a list of courses already taken, and see if a program is satisfied
- [x] Misc
  - [x] Display statistics on current viewing graph / course
  - [x] Create separate static page with global statistics and interesting graphs
  - [x] Home page
  - [x] Better project title
  - [x] Favicon

### Phase 4: Data Analysis

- [ ] Which courses have the highest/lowest number of prerequisites?
- [ ] Which programs/departments have the most/least strict course requirements?
- [ ] Which course pathways keep the most program options open?
- [ ] Which courses are the most/least interdiscplinary (i.e. required for programs from different departments)?
- [ ] Which programs cover the most breadth requirements?
- [ ] How can we cluster similar courses together, or organize them by similar subject area?
- [ ] How does the distribution of lectures, tutorials, practicals, or seminars hours differ across programs?
- [ ] Is there a difference in learning styles between majors, based on lecture - tutorial ratios?

### Phase 5: Proofread + Submit

- [ ] Get rid of all Pycharm errors
- [ ] Clean up code structure and file structure
- [ ] Carefully read comments
  - [ ] Get rid of any TODOs
  - [ ] Make sure no testing code is still there
  - [ ] Check docstrings
  - [ ] Add comments to long functions
  - [ ] Module docstring headers
- [ ] Check PythonTA for all files
- [ ] Write doctests
- [ ] Create sample dataset + export
  - [ ] Test that it downloads and can be parsed correctly by our program
- [ ] Check that visualization works (both Windows and Mac and various browsers) with no prior setup
- [ ] Citations:
  - [x] flask
  - [x] visjs
  - [x] 3d-force-graph library: https://github.com/vasturiano/3d-force-graph
  - [ ] JS CDNs we are fetching from (or do we make local versions of those js files?)
    - [ ] https://unpkg.com/
    - [ ] esm.sh
  - [x] three.js
  - [x] beautiful soup
  - [x] matplotlib and seaborn for graphs
  - [x] python standard lib: logger, os, unittest, time, json, etc. (mostly in my parsers)
  - [ ] LLMs
  - [x] https://latex.vercel.app/ (stylesheet for global stats)
- [ ] Submit
- [ ] Check everything over on a fresh computer (seriously everyone do this)
  - [ ] Andrei
  - [ ] Angela
  - [ ] Jack
  - [ ] Jasmine

### Report

- [ ] Sections
  - [x] Project title
  - [x] Names of all group members
  - [ ] Introduction
    - [ ] Project question/goal in bold
  - [ ] Datasets used
  - [ ] Computational overview
    - [ ] How trees/graphs represent data
    - [ ] Major computations (algorithms) performed (such as: building trees/graphs from a dataset or computation, data transformation/filtering/aggregation, computational models, and/or algorithms)
    - [ ] How program shows results in visual way
    - [ ] How we used new Python libraries
  - [ ] Instructions for running the program
    - [ ] Write `requirements.txt` file for Python libraries to install
    - [ ] Instructions for how to download zip file for datasets
    - [ ] Describe what should happen when `main.py` is run
    - [ ] Describe how interactive visualization can be used
  - [ ] Describe changes to the project proposal
  - [ ] Discussion
    - [ ] Do the results of your computational exploration help answer this question/achieve your goal?
    - [ ] What limitations did you encounter, with the datasets you found, the algorithms/libraries you used, or other obstacles?
    - [ ] What are some next steps for further exploration?
  - [ ] References
- [ ] Edit report
  - [ ] Andrei
  - [ ] Angela
  - [ ] Jack
  - [ ] Jasmine
- [ ] Proofread report
  - [ ] Andrei
  - [ ] Angela
  - [ ] Jack
  - [ ] Jasmine
- [ ] Submit report
- [ ] Check over report
  - [ ] Andrei
  - [ ] Angela
  - [ ] Jack
  - [ ] Jasmine

### Extra Stuff For Fun

- Scrape Timetable Builder data
- Analyze difficulty of courses based on enrollment data
- Look at [Reddit spreadsheet](https://old.reddit.com/r/UofT/comments/14fa1ua/i_made_a_database_of_uoft_courses_with_their/) for crowdsourced course averages
- Some classes have fees. Extract the fee amounts.

### Publication

- [ ] Choose a better project name
- [ ] Create new GitHub repo
- [ ] Clean up code, if needed
- [ ] Buy a domain
- [ ] Publish on web
- [ ] Test on a variety of browsers; try our best to break it
- [ ] Share!

## Similar Projects

### Courseography
- https://courseography.cdf.toronto.edu/graph
- https://github.com/Courseography/courseography.git

### UofT Index
- https://uoftindex.ca/home
- https://github.com/uoftindex

### Enrollment Tracker
- https://icprplshelp.github.io/UofT-Enrollment-Tracker/

### Glossary of Course Codes
- https://www.sgs.utoronto.ca/policies-guidelines/glossary-of-course-codes-primary-and-joint-course-codes/
