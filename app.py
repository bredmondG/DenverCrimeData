import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
#set FLASK_ENV=development


#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/denvercrimedata.sqlite"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)


#################################################
# Define Routes
#################################################

@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/bikeracks")
def bikeracks():
    """Return bike rack data."""

    df = pd.read_sql('SELECT bikeracks."latitude", bikeracks."longitude" from bikeracks', db.session.bind)
    return df.to_json(orient='records')

@app.route("/crimes")
def crimes():
    """Return crime data."""
 
    df = pd.read_sql('SELECT crimedata."ID", crimedata."CRIME_CATEGORY", crimedata."CRIME_OFFENSE", crimedata."Date",  crimedata."CRIME_ADDRESS", crimedata.longitude, crimedata.latitude, crimedata.neighborhood FROM crimedata', db.session.bind)
    return df.to_json(orient='records')

@app.route("/streetlights")
def streetlights():
    """Return street light data."""

    df = pd.read_sql('SELECT streetlights."POLE_COND", streetlights."longitude", streetlights."latitude" FROM streetlights', db.session.bind)
    return df.to_json(orient='records')

@app.route("/crimeMap/<crime>/<location>")
def crimeMap(crime, location):
    """return crimemap data"""
    df = pd.read_sql('''SELECT crimedata."ID", crimedata."CRIME_CATEGORY", crimedata."CRIME_OFFENSE",  crimedata."CRIME_ADDRESS", crimedata.longitude, crimedata.latitude, crimedata.neighborhood 
    FROM crimedata ''', db.session.bind)
    
    locDF = df[df["neighborhood"] == location]
    crimes = locDF[locDF["CRIME_OFFENSE"] == crime]
    return crimes.to_json(orient='records')

@app.route("/crimecatchart")
def crimecatchart():
    """returns crime category data"""
    dfcrime = pd.read_sql('SELECT crimedata."ID", crimedata."CRIME_CATEGORY", crimedata."CRIME_OFFENSE", crimedata."Date",  crimedata."CRIME_ADDRESS", crimedata.longitude, crimedata.latitude, crimedata.neighborhood FROM crimedata', db.session.bind)
    
    offense = dfcrime.groupby("CRIME_OFFENSE").describe()

    offense_data = {
        "offense": offense["ID"].index.tolist(),
        "counts": offense["ID"]["count"].tolist()
    }

@app.route("/offensetypes")
def offensetypes():
    """retunrs list of crime category for dropdown"""
    dfcrime = pd.read_sql('SELECT crimedata."ID", crimedata."CRIME_CATEGORY", crimedata."CRIME_OFFENSE", crimedata."Date",  crimedata."CRIME_ADDRESS", crimedata.longitude, crimedata.latitude, crimedata.neighborhood FROM crimedata', db.session.bind)

    offense = dfcrime.groupby("CRIME_OFFENSE").describe()

    return jsonify(offense.index.tolist())

@app.route("/locations")
def locations():
    """retunrs list of crime category for dropdown"""
    dfcrime = pd.read_sql('SELECT crimedata."ID", crimedata."CRIME_CATEGORY", crimedata."CRIME_OFFENSE", crimedata."Date",  crimedata."CRIME_ADDRESS", crimedata.longitude, crimedata.latitude, crimedata.neighborhood FROM crimedata', db.session.bind)

    neighborhoods = dfcrime.groupby("neighborhood").describe()

    return jsonify(neighborhoods.index.tolist())


@app.route("/crimetypechart/<crime>/<location>")
def crimetypechart(crime, location):

    """returns crime type data"""
    
    df = pd.read_sql('''SELECT crimedata."ID", crimedata."CRIME_CATEGORY", crimedata."CRIME_OFFENSE",  crimedata."CRIME_ADDRESS", crimedata.longitude, crimedata.latitude, crimedata.neighborhood 
    FROM crimedata ''', db.session.bind)
    
    locDF = df[df["neighborhood"] == location]
    crimes = locDF[locDF["CRIME_OFFENSE"] == crime]

    crime_type = crimes.groupby("CRIME_CATEGORY").describe()

    type_data = {
        "crime_types": crime_type.index.tolist(),
        "counts": crime_type['ID']['count'].tolist()

    }

    return jsonify(type_data)


if __name__ == "__main__":
    app.run()
