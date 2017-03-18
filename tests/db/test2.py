from sqlalchemy import create_engine, MetaData, Table, Column, String, Integer, ForeignKey, join
from sqlalchemy.orm import sessionmaker, mapper, relationship
from sqlalchemy.ext.declarative import declarative_base, AbstractConcreteBase
from sqlalchemy.orm import column_property, configure_mappers, sessionmaker

metadata = MetaData()

engine = create_engine('sqlite:///', echo=True)

Base = declarative_base(engine, metadata)

employee = Table('employee', metadata, Column('id', Integer, primary_key=True), Column('name', String(60)), extend_existing=True)

model2 = Table('model2', metadata, Column('id', Integer, primary_key=True), Column('name', String(60)), extend_existing=True)

manager = Table('mamanger', metadata, Column('test_ptr_id', ForeignKey('employee.id')), Column('job', String(100)), Column('model2_id', ForeignKey('model2.id')))

model2 = Table('model2', metadata, Column('name2', String(100)), extend_existing=True)

metadata.create_all(engine)


model2.create(engine)

_manager = join(employee, manager)


class Manager:
    pass


class Model2:
    id = column_property(employee.c.id, manager.c.test_ptr_id)


mapper(Model2, model2)
mapper(Manager, _manager, properties={
    'model2': relationship(Model2)
})


Session = sessionmaker(engine)
session = Session()

m = Manager()
m.name = 'test'
m.job = 'my job'
session.add(m)

for m in session.query(Manager).all():
    print(m.name)
