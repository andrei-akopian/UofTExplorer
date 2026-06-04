# REST API reverse engineered spec
```txt
divisionalLegends : bunches of html tags with descriptions for something
divisionalEnrolmentIndicators : list of enrollment control types and what they mean (useful)
pageableCourse: main course data
    total: total number of courses
    page: search results current page
    pageSize: page size
    direction: None for unknown reasons. presumeably ascending / descending or something.
    courses: the list actual courses, where each course has
        id: in hex, roughly sequential
        title: empty
        name: course name
        ucName: idk, blank
        code: coursecode
        sectionCode: Y or H
        campus: campus
        sessions: presumeably the semesters the course is running ['20269', '20271']
        duration: empty
        cmCourseInfo: basically duplicate of ArtSci Calendar scrapes
        created, modified, lastSaved: time stamps
        primaryTeachMethod: LEC for lecture; could be a lab heavy course.
        faculty: {'code': 'ARTSC', 'name': 'Faculty of Arts and Science'}
        coSec: idk
        department: the department this course is under
        maxCredit, minCredit: idk
        breadths: pretty big dict telling the breadth req, and the faculty. (breadths are faculty dependent)
        notes: for example "Students must enrol in a tutorial section at the same time they enrol", or other requirements
        cancelInd: idk, always says "N"
        subscriptionTtb: idk
        subscriptionOpenData: idk
        tb1Active: idk
        tb2Active: idk
        primaryWaitlistable: idk
        primaryFull: idk
        fullyOnline: idk
        sections: list of lecture sections
            name: section name
            type: Lecuture or Tutorial etc. in plaintext
            teachMethod: same as type, but a 3 letter code
            sectionNumber: section number
            meetingTimes: convoluted dict of time specifications
            firstMeeting: empty
            instructors: list of instructors
            currentEnrolment: int
            maxEnrolment: int
            subTitle: subtitle, usually empty
            'cancelInd', 'waitlistInd', 'deliveryModes', 'currentWaitlist: idk 
            'enrolmentInd', 'tbaInd', 'openLimitInd': idk
            notes: [{'name': 'Section Note', 'type': 'SECTION', 'content': ''}]
            enrolmentControls: huge dict describing who can sign up.
            linkedMeetingSections: empty, dik
```