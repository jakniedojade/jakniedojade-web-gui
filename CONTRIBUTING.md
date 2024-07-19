# Workflow
To prevent accidental catastrofic changes while working on the project (for example removal of the whole commit history), **the production branch - `main` and the development branch - `dev`** are protected and don't allow pushing changes directly. Instead changes must go through a review process, which consists of:
1. Making a new branch in the repository
2. Pushing new changes to it
3. After finishing the work on a new feature, opening a pull request to the `dev` branch
4. After testing and considering those new changes stable, they will be merged to the `main` branch

# Task managment
Features and bug fixes should first be discussed (or at least presented) in an issue, before making a pull request. Issues track things which need to be done in the project and anyone can "take them on" and resolve them. Anyone can also open an issue to get feedback on their idea.

When opening an issue, a previous research should be made, and all relevent info (error messages, logs, screenshots) posted, so that it can get fixes as soon as possible.

Pull requests opened without a corresponding issue can also be merged, but they **should be avoided** and mostly used when the problem is obvious and easy to fix.

# Natural languages
Both the code, comments and discussion should be in English.
The strings will be in at least Polish and English versions (more languages could be added, if there are translators for them ready to help)

# Programming and scripting languages
It's best to keep the number of new languages and technologies at a minimum. Currently the project uses:
- Python (main backend logic, data analysis and parsing)
- Go (from [WarsawGTFS](https://github.com/MKuranowski/WarsawGTFS) - parsing making gtfs files )
- Shell scripts (for convinience and configuration)

If new languages or technologies are to be added, it's best if they would be seperated from one another.
