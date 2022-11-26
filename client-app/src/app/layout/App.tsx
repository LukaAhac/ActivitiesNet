import React, { Fragment, useEffect, useState } from 'react';
import {Button, Container} from 'semantic-ui-react';
import { Activity } from '../models/activity';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import {v4 as uuid} from 'uuid';
import agent from '../api/agent';
import LoadingComponent from './LoadingComponent';
import { useStore } from '../stores/store';
import { observer } from 'mobx-react-lite';

function App() {
const {activityStore} = useStore();

const [activities, setActivities] = useState<Activity[]>([]);
const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
const [editMode, setEditMode] = useState(false);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);

useEffect(() => {
  agent.Activites.list().then(response => {
    let activities: Activity[] = [];
    response.forEach(activity => {
      activity.date = activity.date.split("T")[0];
      activities.push(activity);
    })
    setActivities(response);
    setLoading(false);
  })
}, [])

function handleSelectActivity(id: string){
  setSelectedActivity(activities.find(x => x.id === id))
}

function handleCancleSelectActivity(){
  setSelectedActivity(undefined);
}

function handleFormOpen(id? : string){
  id ? handleSelectActivity(id) : handleCancleSelectActivity();
  setEditMode(true);
}

function handleFormClose(){
  setEditMode(false);
}

function handleCreateOrEditActivity(activity : Activity){
  setSubmitting(true);
  if (activity.id){
    agent.Activites.update(activity).then(() => {
      setActivities([...activities.filter(x => x.id !== activity.id), activity]);
      setSelectedActivity(activity);
      setEditMode(false);
      setSubmitting(false);
    })
  } else {
    activity.id = uuid();
    agent.Activites.create(activity).then(() => {
      setActivities([...activities, activity]);
      setSelectedActivity(activity);
      setEditMode(false);
      setSubmitting(false);
    })
  }
}

function handleDeleteActivity(id: string){
  setSubmitting(true);
  agent.Activites.delete(id).then(() => {
    setActivities([...activities.filter(x => x.id !== id)]);
    setSubmitting(false);
  })
}

if (loading) return <LoadingComponent content='Loading app' />

  return (
    <> 
      <NavBar
        openForm={handleFormOpen}
      />
      <Container style={{marginTop: '7em'}}>
        <h2>{activityStore.title}</h2>
        <Button content='Add excalamation!' positive onClick={activityStore.setTitle}/>

        <ActivityDashboard
          activities={activities}
          selectedActivity={selectedActivity}
          selectActivity={handleSelectActivity}
          cancleSelectActivity={handleCancleSelectActivity}
          editMode={editMode}
          openForm={handleFormOpen}
          closeForm={handleFormClose}
          createOrEdit={handleCreateOrEditActivity}
          deleteActivity={handleDeleteActivity}
          submitting={submitting}
        />
      </Container>
    </>
  );
}

export default observer(App);
