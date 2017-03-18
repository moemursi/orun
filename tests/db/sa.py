import sqlalchemy as sa
from sqlalchemy import Column, Integer, Float, String, Table, ForeignKey
from sqlalchemy.orm import mapper, sessionmaker

db = sa.create_engine('sqlite://', echo=True)
metadata = sa.MetaData(bind=db)
Session = sessionmaker(db)
session = Session()


class Building(object):
    id = Column(Integer, primary_key=True)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)


class Commercial(Building):
    business = Column(String(50))


class Residential(Building):
    num_residents = Column(Integer)


building = Table(
    'building', metadata,
    Column('id', Integer, primary_key=True),
    Column('x', Integer),
    Column('y', Integer),
)
commercial = Table(
    'commercial', metadata,
    Column('building_id', Integer, ForeignKey('building.id'), primary_key=True),
    Column('business', String(50)),
)
residential = Table(
    'residential', metadata,
    Column('building_id', Integer, ForeignKey('building.id'), primary_key=True),
    Column('numResidents', Integer),
)

mapper(Building, building)
mapper(Commercial, commercial, inherits=Building)
mapper(Residential, residential, inherits=Building)

metadata.create_all(db)

obj = Residential()
obj.x = 10
obj.y = 10
session.add(obj)
session.commit()

for obj in session.query(Residential):
    print(obj.x)
