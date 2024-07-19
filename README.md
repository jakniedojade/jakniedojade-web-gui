# Jakniedojade

A Django and Angular app for visualization and analysis of data about Warsaw public transport collected using an open API shared by the Warsaw City Hall at https://api.um.warszawa.pl.

This repo contains both the python code used for analysing, collecting data and running the server backend. And also the frontend code for displaying it in a user-friendly fashion on a website.

# Installation
Currently the backend code has been tested on the following environments:
- Linux (debian "bookworm")
- Windows 10

Mac systems have not yet been tested on.

## Linux systems
The following instructions were tested on debian "bookworm". For other distributions it may be required to find and install other packages.
### Requirements
Install required system packages:
```
sudo apt install git pipenv golang python3-dev default-libmysqlclient-dev build-essential pkg-config
```
### Setting up the dev environment
After preparing the system packages, clone the repo and run the `prepare.sh` script.
```
git clone https://github.com/pawheb/jakniedojade.git
cd jakniedojade/
./prepare.sh
```
### Setting up Python virutalenv
Python packages for the app are managed by `pipenv`. It allows for listing packages, downloading them and executing in a virtual environment.

**ATTENTION**<br>
For `pipenv` to see the `Pipfile`, it needs to be ran from the same directory.

To install all required Python packages and execute the virtual environment, run:
```
pipenv install
pipenv shell
```
On the left side, there should be the name of the virtualenv in parentheses.
### Running the API scraper
If all the above steps ran successfully, before starting the python backend code, a `MySQL` service needs to be running or the `db.sqlite3` file needs to created (if using the testing database). See [Setting up and connecting a database](#setting-up-and-connecting-a-database).
To run the scraper and collect data from the City Hall API, run **in the virtualenv**:
```
python3 manage.py migrate
python3 manage.py scrap_api -K [warsaw_api_key]
```
There is also a scraper mode available in which it saves the collected data to a directory:
```
python3 manage.py scrap_api -a -K [warsaw_api_key]
```
The saved data can then be loaded using:
```
python3 manage.py load_data_archive -g [path_do_directory_with_gtfs_zips] -p [path_to_directory_with_position_jsons]
```

## Windows systems
Tested on Windows 10.

### Requirements
Programs which need to be installed to work with the project:
- [Python 3.11](https://www.python.org/downloads/)
- [The Go programming language](https://go.dev/dl/)
- [Git](https://git-scm.com/download/win)

**ATTENTION**<br>
When using the Python Windows installer, the "add to PATH" options should be checked. Otherwise using the interpreter in Windows terminal won't be possible.
### Setting up the dev environment
Clone the repo and download required submodules:
```
git clone https://github.com/pawheb/jakniedojade.git
git submodule init
git submodule update
```
(**Optional**) Compile the go program for generating position and brigades jsons (so it can work faster):
```
cd WarsawGTFS/
go build -v warsawgtfs_realtime.go
cd ../
```
### Setting up the python virtualenv
On Windows systems `pipenv` needs to be first installed using `pip`:
```
pip install pipenv
```
or if the above doesn't work:
```
python -m pip install pipenv
```

**ATTENTION**<br>
For `pipenv` to see the `Pipfile`, it needs to be ran from the same directory.

To install all required Python packages and execute the virtual environment, run:
```
pipenv install
pipenv shell
```
or if the above doesn't work:
```
python -m pipenv install
python -m pipenv shell
```
On the left side, there should be the name of the virtualenv in parenthesis.
### Running the API scraper
Same as for Linux systems [above](#running-the-api-scraper)

## Setting up and connecting a database
Currently the Django backend can use 2 possible database managment systems:
- (**default**) MySQL - the preferred database for production and development
- SQLite3 - used in testing and sometimes when developing quick fixes

### MySQL
To use MySQL these environmental variables need to be passed to the python interpreter:
- MYSQL_DB=[database_name]
- MYSQL_USER=[database_user_name]
- MYSQL_PASSWORD=[database_user_password]
- MYSQL_HOST=[database_host_address]
- MYSQL_PORT=[database_port]

These environmental variables need to be passed every time whenever the python interpreter using the database is ran.

### SQLite3
To use the SQLite3 backend:
1. Pass the `--settings=project_config.github-actions-tests` flag for every Django action which requires database access

## Running the http server
### In the development mode
If the installation was successful, to run the local development server, run (**while being in the virtualenv**):
```
python3 manage.py runserver
```
### In production mode
To run the Django server in production mode (which for example doesn't serve static files or doesn't return error codes and debug info), pass the environmental variable:
- WEBSITE_HOSTNAME=[host_address]

`host_address` needs to be set to the address the Django server is being run from or `*` for all hosts (only for development purposes).

## Container setup
Container development configuration setups are also available (in the devcontainer format in the `.devcontainer` directory and as a `docker-compose.yaml` file).

To run them use either an appropriate [devcontainer-compatible](https://containers.dev/) program or a [docker-compose](https://docs.docker.com/compose/)-compatible program.

These container configurations have an already configured development environment using the instructions above.

**These container environments currently can only run the development setup and shouldn't be used in production, because they don't have the neccesary configuration options**.

### Using docker-compose
To run the development setup using docker-compose:
1. Make a file called `waw_api_key.txt` which contains your API key for [https://api.um.warszawa.pl/](https://api.um.warszawa.pl/) (whitespaces in the file will be ignored)
2. Run `docker-compose up` to start the container environment

To clear the previous database data, remove the volume named `[app_name]_mariadb_data`.

# Contributing
Thank you for taking interest in helping improve the project 💚<br>
We are glad that you wish to help it grow and look forward to your contributions!

Tips and directions for adding your contributions can be found in [CONTRIBUTING.md](CONTRIBUTING.md).

# Thanks ♥️
[Mikołaj Kuranowski - WarsawGTFS](https://github.com/MKuranowski/WarsawGTFS)<br>
Used for:
- connecting specific buses with their timetable
- parsing files downloaded from the WTP ftp server and real-time data from https://api.um.warszawa.pl
- making `gtfs` files from the data above
