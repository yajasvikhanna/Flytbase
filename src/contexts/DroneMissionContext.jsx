import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const DroneMissionContext = createContext();

export function useDroneMission() {
  return useContext(DroneMissionContext);
}

export function DroneMissionProvider({ children }) {
  const [drones, setDrones] = useState([]);
  const [missions, setMissions] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeMission, setActiveMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  
  const { currentUser } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Initialize socket connection
  useEffect(() => {
    if (currentUser) {
      const token = localStorage.getItem('token');
      const newSocket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
        auth: {
          token
        }
      });
      
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentUser]);
  
  // Socket event listeners
  useEffect(() => {
    if (socket) {
      socket.on('drone-update', (updatedDrone) => {
        setDrones(prevDrones => 
          prevDrones.map(drone => 
            drone._id === updatedDrone._id ? updatedDrone : drone
          )
        );
      });
      
      socket.on('mission-update', (updatedMission) => {
        setMissions(prevMissions => 
          prevMissions.map(mission => 
            mission._id === updatedMission._id ? updatedMission : mission
          )
        );
        
        if (activeMission && activeMission._id === updatedMission._id) {
          setActiveMission(updatedMission);
        }
      });
      
      socket.on('new-mission', (newMission) => {
        setMissions(prevMissions => [...prevMissions, newMission]);
      });
      
      socket.on('new-drone', (newDrone) => {
        setDrones(prevDrones => [...prevDrones, newDrone]);
      });
      
      socket.on('new-report', (newReport) => {
        setReports(prevReports => [...prevReports, newReport]);
      });
      
      return () => {
        socket.off('drone-update');
        socket.off('mission-update');
        socket.off('new-mission');
        socket.off('new-drone');
        socket.off('new-report');
      };
    }
  }, [socket, activeMission]);
  
  // Fetch drones
  const fetchDrones = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/drones`);
      
      if (response.data.status === 'success') {
        setDrones(response.data.data.drones);
      }
      
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch drones');
      setLoading(false);
    }
  }, [API_URL]);
  
  // Fetch missions
  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/missions`);
      
      if (response.data.status === 'success') {
        setMissions(response.data.data.missions);
      }
      
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch missions');
      setLoading(false);
    }
  }, [API_URL]);
  
  // Fetch reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reports`);
      
      if (response.data.status === 'success') {
        setReports(response.data.data.reports);
      }
      
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch reports');
      setLoading(false);
    }
  }, [API_URL]);
  
  // Create new mission
  const createMission = async (missionData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/missions`, missionData);
      
      if (response.data.status === 'success') {
        setMissions(prevMissions => [...prevMissions, response.data.data.mission]);
      }
      
      setLoading(false);
      return response.data.data.mission;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create mission');
      setLoading(false);
      throw error;
    }
  };
  
  // Update mission
  const updateMission = async (missionId, updateData) => {
    try {
      setLoading(true);
      const response = await axios.patch(`${API_URL}/missions/${missionId}`, updateData);
      
      if (response.data.status === 'success') {
        const updatedMission = response.data.data.mission;
        
        setMissions(prevMissions => 
          prevMissions.map(mission => 
            mission._id === missionId ? updatedMission : mission
          )
        );
        
        if (activeMission && activeMission._id === missionId) {
          setActiveMission(updatedMission);
        }
      }
      
      setLoading(false);
      return response.data.data.mission;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update mission');
      setLoading(false);
      throw error;
    }
  };
  
  // Control mission (start, pause, resume, abort)
  const controlMission = async (missionId, action) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/missions/${missionId}/control`, { action });
      
      if (response.data.status === 'success') {
        const updatedMission = response.data.data.mission;
        
        setMissions(prevMissions => 
          prevMissions.map(mission => 
            mission._id === missionId ? updatedMission : mission
          )
        );
        
        if (activeMission && activeMission._id === missionId) {
          setActiveMission(updatedMission);
        }
      }
      
      setLoading(false);
      return response.data.data.mission;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to control mission');
      setLoading(false);
      throw error;
    }
  };
  
  // Register new drone
  const registerDrone = async (droneData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/drones`, droneData);
      
      if (response.data.status === 'success') {
        setDrones(prevDrones => [...prevDrones, response.data.data.drone]);
      }
      
      setLoading(false);
      return response.data.data.drone;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to register drone');
      setLoading(false);
      throw error;
    }
  };
  
  // Update drone
  const updateDrone = async (droneId, updateData) => {
    try {
      setLoading(true);
      const response = await axios.patch(`${API_URL}/drones/${droneId}`, updateData);
      
      if (response.data.status === 'success') {
        setDrones(prevDrones => 
          prevDrones.map(drone => 
            drone._id === droneId ? response.data.data.drone : drone
          )
        );
      }
      
      setLoading(false);
      return response.data.data.drone;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update drone');
      setLoading(false);
      throw error;
    }
  };
  
  // Get mission by ID
  const getMissionById = async (missionId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/missions/${missionId}`);
      
      if (response.data.status === 'success') {
        setActiveMission(response.data.data.mission);
      }
      
      setLoading(false);
      return response.data.data.mission;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get mission');
      setLoading(false);
      throw error;
    }
  };
  
  // Get report by ID
  const getReportById = async (reportId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reports/${reportId}`);
      
      setLoading(false);
      return response.data.data.report;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get report');
      setLoading(false);
      throw error;
    }
  };
  
  // Load initial data when user is authenticated
  useEffect(() => {
    if (currentUser) {
      fetchDrones();
      fetchMissions();
      fetchReports();
    }
  }, [currentUser, fetchDrones, fetchMissions, fetchReports]);
  
  const value = {
    drones,
    missions,
    reports,
    activeMission,
    loading,
    error,
    createMission,
    updateMission,
    controlMission,
    registerDrone,
    updateDrone,
    getMissionById,
    getReportById,
    setActiveMission,
    fetchDrones,
    fetchMissions,
    fetchReports,
    setError
  };
  
  return (
    <DroneMissionContext.Provider value={value}>
      {children}
    </DroneMissionContext.Provider>
  );
}