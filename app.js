// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyCeuGOn0QV23KBLA9Z3XFso2mNcNjbK6tY",
    authDomain: "meeting-scheduler-ca23e.firebaseapp.com",
    projectId: "meeting-scheduler-ca23e",
    storageBucket: "meeting-scheduler-ca23e.appspot.com",
    messagingSenderId: "994508481089",
    appId: "1:994508481089:web:637d9990464a13901c5cc0"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const teachers = ['Educação Infantil', 'Ensino Fundamental 1', 'Ensino Fundamental 2', 'Ensino Médio'];
const teacherSelect = document.getElementById('teacher-name');
const form = document.getElementById('meeting-form');
const meetingsList = document.getElementById('meetings-list');

// Populate teacher options
teachers.forEach(teacher => {
  const option = document.createElement('option');
  option.value = teacher;
  option.textContent = teacher;
  teacherSelect.appendChild(option);
});

// Save meeting to Firebase
function saveMeeting(meeting) {
  const meetingsRef = ref(database, 'meetings');
  push(meetingsRef, meeting);
}

// Display a meeting in the list with formatted date
function displayMeeting(meeting) {
  const formattedDate = formatDate(meeting.date);
  const li = document.createElement('li');
  li.textContent = `${formattedDate} às ${meeting.time} com Coordenador de ${meeting.teacher}`;
  meetingsList.appendChild(li);
}

// Function to format date from 'yyyy-mm-dd' to 'dd-mm-yyyy'
function formatDate(dateString) {
  const dateParts = dateString.split('-'); // Split the date string
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  return `${day}-${month}-${year}`; // Rearrange and return the new format
}

// Check if the date is a weekday (Monday to Friday)
function isWeekday(dateString) {
  const date = new Date(dateString);
  const day = date.getDay(); // Sunday - Saturday : 0 - 6
  return day >= 1 && day <= 5; // 1: Monday, 5: Friday
}

// Check if time is between 08:00–12:00 or 14:00–18:00
function isValidTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;

  const morningStart = 8 * 60; // 08:00 in minutes
  const morningEnd = 12 * 60;  // 12:00 in minutes

  const afternoonStart = 14 * 60; // 14:00 in minutes
  const afternoonEnd = 18 * 60;   // 18:00 in minutes

  const inMorning = totalMinutes >= morningStart && totalMinutes < morningEnd;
  const inAfternoon = totalMinutes >= afternoonStart && totalMinutes < afternoonEnd;

  return inMorning || inAfternoon;
}

// Handle form submission with validation
form.addEventListener('submit', function(event) {
  event.preventDefault();

  const teacher = teacherSelect.value;
  const date = document.getElementById('meeting-date').value;
  const time = document.getElementById('meeting-time').value;

  // Validate date and time
  if (!isWeekday(date)) {
    alert('Reuniões somente podem ser agendadas de Segunda à Sexta.');
    return;
  }

  if (!isValidTime(time)) {
    alert('Reuniões somente podem ser agendadas entre 08:00-12:00 e 14:00–18:00.');
    return;
  }

  const meeting = { teacher, date, time };
  saveMeeting(meeting);
  form.reset();
});

// Get meetings from Firebase
function getMeetings() {
  const meetingsRef = ref(database, 'meetings');
  onChildAdded(meetingsRef, (snapshot) => {
    const meeting = snapshot.val();
    displayMeeting(meeting);
  });
}

// Load meetings on page load
document.addEventListener('DOMContentLoaded', function() {
  getMeetings();
});
