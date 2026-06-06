# UofT Explorer

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Jupyter Notebook](https://img.shields.io/badge/jupyter-%23FA0F00.svg?style=for-the-badge&logo=jupyter&logoColor=white)

A graph visualizer tool for courses and their requisites at the University of Toronto.

Originally completed as a project for [CSC111 — Foundations of Computer Science II](https://artsci.calendar.utoronto.ca/course/csc111h1) and currently a work in progress for further improvements and deployment.

## Features

## Related Projects

- [Courseography](https://courseography.cdf.toronto.edu/graph)
- [UofT Index](https://uoftindex.ca/home)
- [Enrollment Tracker](https://icprplshelp.github.io/UofT-Enrollment-Tracker/)

## Project Structure

```mermaid
flowchart TD
    subgraph DataSources[Data Sources]
      ttb[TTB]
      artscical[ArtSci Calendar]
    end
    scrapers[scrapers]
    scraped_data[.html / .json scrapes]
    parsers[parsers]
    refiner[refinement and sanity checks]
    ttb --> scrapers
    artscical --> scrapers
    scrapers --> scraped_data
    scraped_data --> parsers
    parsers --> structured_data
    structured_data --> refiner
    core --> refiner
    data_analysis <--> refiner
    refiner --> database
    data_analysis --> database
    sat --> core
    core --> backend
    data_analysis --> backend
    backend[Flask backend]
    database --> backend
    frontend[React frontend]
    backend <--> frontend
```

## Contributors

<a href="https://github.com/andrei-akopian/UofTExplorer/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=andrei-akopian/UofTExplorer" />
</a>
