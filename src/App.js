import React, { useEffect, useState } from "react";
import "./App.css";
import { ShiftService } from "./services/shift.service";
import "react-toastify/dist/ReactToastify.css";
function App() {

  const [shifts, setShifts] = useState([]);

  const getShiftReponse = async () => {
    const shiftResponse = await ShiftService.getShifts();
    console.log("shiftResponse", shiftResponse);
    setShifts(shiftResponse?.data);
  };

  useEffect(() => {
    getShiftReponse();
  }, []);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(alert("Geolocation is not supported by your browser."));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              alert(
                "Location permission is required to continue.\n\nPlease allow it in your browser settings and try again."
              );
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              alert("Location unavailable");
            } else if (error.code === error.TIMEOUT) {
              alert("Location request timed out");
            } else {
              alert("Unknown location error");
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    });
  };

  const currentFormattedDate = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  const handleStartVisit = async (shift) => {
    const location = await getCurrentLocation();
    const formattedDate = currentFormattedDate();
    if (formattedDate === shift.date) {
      await ShiftService.logShiftVisits({
        shift_id: shift.id,
        lat: location?.lat,
        lng: location?.lng,
      });
      getShiftReponse();
    } else {
      alert("Your shift is not today!");
    }
  };

  const handleEndVisit = async (shift) => {
    const location = await getCurrentLocation();
    const formattedDate = currentFormattedDate();
    if (formattedDate === shift.date) {
      await ShiftService.logShiftVisits({
        shift_id: shift.id,
        lat: location?.lat,
        lng: location?.lng,
      });
      getShiftReponse();
    } else {
      alert("Your shift is not today!");
    }
  };

  const handleDateTime = (utcDateString) => {
    const date = new Date(utcDateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Shift Visit Tracker</h1>
        <p>Track your work visits with timestamps and geolocation</p>
      </header>
      <main className="shift-list">
        {shifts.map((shift) => (
          <div key={shift.id} className="shift-card">
            <div className="shift-info">
              <div className="shift-date">
                <span className="label">Shift Date:</span>
                <span>{shift.date}</span>
              </div>
              <div className="shift-time">
                <span className="label">Time:</span>
                <span>
                  {shift.startTime} - {shift.endTime}
                </span>
              </div>
              <div className="client-info">
                <h3>{shift.clientName}</h3>
                <p>{shift.address}</p>
              </div>
            </div>
            <div className="visit-actions">
              <button
                onClick={() => handleStartVisit(shift)}
                disabled={shift.visitLogs.length >= 1}
                className={`action-btn ${
                  shift.visitLogs.length >= 1 ? "completed" : ""
                }`}
              >
                {shift.visitLogs.length >= 1
                  ? "✓ Start Visit Recorded"
                  : "Start Visit"}
              </button>
              <button
                onClick={() => handleEndVisit(shift)}
                disabled={!shift.visitLogs[0] || shift.visitLogs.length === 2}
                className={`action-btn ${
                  shift.visitLogs.length === 2 ? "completed" : ""
                }`}
              >
                {shift.visitLogs.length === 2
                  ? "✓ End Visit Recorded"
                  : "End Visit"}
              </button>
            </div>
            {shift.visitLogs.map((visitLog) => {
              return (
                <div className="visit-record">
                  <h4>
                    {visitLog.type === "start"
                      ? "Start Visit Details:"
                      : "End Visit Details:"}
                  </h4>
                  <p>Date and Time: {handleDateTime(visitLog.timestamp)}</p>
                  <p>
                    Address:
                    {visitLog.location.latitude.toFixed(6)},{" "}
                    {visitLog.location.longitude.toFixed(6)}
                  </p>
                </div>
              );
            })}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;