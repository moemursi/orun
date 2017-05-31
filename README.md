# Orun

Orun is a Python modular business framework, to simplify the ERP/CRM RIA development,
this is a RAD tool that delivers really professionals products in less time.
This is a Django derivative project, using Flask as webserver and inspired on OpenERP/Odoo (a collection of good ideas).

The ORM is built on top of sqlalchemy, although follows Django ORM patterns.

Orun should work with all sqlalchemy compatible database, however, the project goal
is add support for advanced database features, like schemas and other enterprise database resource.

Orun could be even used to build API and WebServices.

Highlights:
* Modularity and Module inheritance
* Full ORM Layer (Model Inheritance)
* Ajax or WebSocket Based
* Incremental Migrations
* Row level based permission control
* Direct SqlAlchemy and Raw Sql


So far, tested on following databases:
* MSSQL - using PyODBC
* Postgresql - using Psycopg2

_more databases soon..._
