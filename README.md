# UofT Explorer

A graph visualizer tool for courses and their requisites at the University of Toronto. Originally completed as a project for [CSC111 — Foundations of Computer Science II](https://artsci.calendar.utoronto.ca/course/csc111h1) by Andrei Akopian, Jasmine Chen, Jack Tang, and Angela Zheng. Currently a work in progress for further improvements and deployment.

## Links

- [Academic Calendar - Search Courses](https://artsci.calendar.utoronto.ca/search-courses)
- [Academic Calendar - Search Programs](https://artsci.calendar.utoronto.ca/search-programs)
- [Academic Calendar - Courses - Printer Friendly](https://artsci.calendar.utoronto.ca/print/view/pdf/course_search/print_page/debug?page=178)
- [Glossary of Course Codes](https://www.sgs.utoronto.ca/policies-guidelines/glossary-of-course-codes-primary-and-joint-course-codes/)

## To-Do

### Languages/Frameworks
- [ ] React
- [ ] TypeScript
- [ ] Tailwind CSS
- [ ] CPython
- [ ] WebAssembly

### Ideas
- [ ] scrape ttb and user for filtering and class sizes
- [ ] make better 2d graph untanglement algorithm
- [ ] improve graph positioning (andrei)
- [ ] cpython sat solver (jack and andrei)
- [ ] check course implications, for example whether mat137 implies mat157 on all prereqs
- [ ] filter out dead courses (andrei)
- [ ] improve UI
- [ ] finish data analysis (seen in section below)
- [ ] rewrite Executive Report
- [ ] add more types of colour coding
- [ ] improve searching capabilities (mostly replacing filtering)
- [ ] add feature of saving queries locally in browser
- [ ] implement server / cloud-hosting for deployment (Docker container?)
- [ ] basic vs. advanced mode

### Data Analysis

- [ ] Which courses have the highest/lowest number of prerequisites?
- [ ] Which programs/departments have the most/least strict course requirements?
- [ ] Which course pathways keep the most program options open?
- [ ] Which courses are the most/least interdiscplinary (i.e. required for programs from different departments)?
- [ ] Which programs cover the most breadth requirements?
- [ ] How can we cluster similar courses together, or organize them by similar subject area?
- [ ] How does the distribution of lectures, tutorials, practicals, or seminars hours differ across programs?
- [ ] Is there a difference in learning styles between majors, based on lecture - tutorial ratios?

### Extra Stuff For Fun

- [ ] Scrape Timetable Builder data
- [ ] Analyze difficulty of courses based on enrollment data
- [ ] Look at [Reddit spreadsheet](https://old.reddit.com/r/UofT/comments/14fa1ua/i_made_a_database_of_uoft_courses_with_their/) for crowdsourced course averages
- [ ] Some classes have fees. Extract the fee amounts.

### Publication

- [ ] Choose a better project name
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
