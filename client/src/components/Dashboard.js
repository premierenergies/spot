import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartJS_Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = window.location.origin;
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartJS_Title,
  Tooltip,
  Legend,
  ArcElement
);

const Container = styled.div`
  display: flex;
  min-height: calc(100vh - 70px); /* Adjusting for header height */
  background-color: #ffffff;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
`;

const DashboardTitle = styled.h1`
  color: #0f6ab0;
  font-size: 36px;
  margin-bottom: 30px;
  text-align: center;
  font-weight: bold;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  justify-content: center;
`;

const TabButton = styled.button`
  background-color: ${(props) => (props.active ? "#0f6ab0" : "#ffffff")};
  color: ${(props) => (props.active ? "#ffffff" : "#0f6ab0")};
  border: 2px solid #0f6ab0;
  border-radius: 5px;
  padding: 10px 15px;
  margin: 0 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background-color: #0f6ab0;
    color: #ffffff;
  }
`;

const ChartContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 30px;
  margin-bottom: 40px;
`;

const ChartWrapper = styled.div`
  width: 45%;
  min-width: 300px;
  max-height: 450px;
  background-color: #f7f7f7;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ChartTitleStyled = styled.h3`
  font-size: 24px;
  color: #333;
  margin-bottom: 5px;
  text-align: center;
`;

const ChartDescription = styled.p`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 15px;
`;

const ChartCanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [tickets, setTickets] = useState([]);
  const [currentTab, setCurrentTab] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUsername = localStorage.getItem("username");
  const empID = localStorage.getItem("empID");
  const emailUser = storedUsername ? `${storedUsername}@premierenergies.com` : "";

  // Role states
  const [isAssignee, setIsAssignee] = useState(false);
  const [isHOD, setIsHOD] = useState(false);

  // Fetch user details
  useEffect(() => {
    if (storedUsername) {
      axios
        .get(`${API_BASE_URL}/api/user`, { params: { email: storedUsername } })
        .then((response) => {
          setUserData(response.data);
        })
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, [storedUsername]);

  // Check if user is in assignee map
  useEffect(() => {
    if (empID) {
      axios
        .get(`${API_BASE_URL}/api/isAssignee`, { params: { empID } })
        .then((response) => {
          setIsAssignee(response.data.isAssignee);
        })
        .catch((error) => console.error("Error checking isAssignee:", error));
    }
  }, [empID]);

  // Check if user is HOD
  useEffect(() => {
    if (empID) {
      axios
        .get(`${API_BASE_URL}/api/isHOD`, { params: { empID } })
        .then((response) => {
          setIsHOD(response.data.isHOD);
        })
        .catch((error) => console.error("Error checking isHOD:", error));
    }
  }, [empID]);

  // Set up tabs based on role
  useEffect(() => {
    if (isHOD) {
      // For HOD, show four tabs.
      setTabs([
        { label: "Assigned by Me", mode: "assignedByMe" },
        { label: "Assigned to Me", mode: "assignedToMe" },
        { label: "Assigned to Dept", mode: "assignedToDept", department: userData.Dept },
        { label: "Assigned by Dept", mode: "assignedByDept", department: userData.Dept },
      ]);
      setCurrentTab({ label: "Assigned by Me", mode: "assignedByMe" });
    } else if (isAssignee) {
      // For assignee non-HOD, two tabs.
      setTabs([
        { label: "Assigned by Me", mode: "assignedByMe" },
        { label: "Assigned to Me", mode: "assignedToMe" },
      ]);
      setCurrentTab({ label: "Assigned by Me", mode: "assignedByMe" });
    } else {
      // For reporters not in the assignee map.
      setTabs([{ label: "My Tickets", mode: "assignedByMe" }]);
      setCurrentTab({ label: "My Tickets", mode: "assignedByMe" });
    }
  }, [isHOD, isAssignee, userData.Dept]);

  // Fetch tickets whenever currentTab changes
  useEffect(() => {
    if (!currentTab) return;
    setLoading(true);
    const params = { mode: currentTab.mode, empID };
    if (
      currentTab.mode === "assignedByDept" ||
      currentTab.mode === "assignedToDept"
    ) {
      params.department = userData.Dept;
    }
    axios
      .get(`${API_BASE_URL}/api/tickets`, { params })
      .then((response) => {
        setTickets(response.data.tickets || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tickets:", error);
        setTickets([]);
        setLoading(false);
      });
  }, [currentTab, empID, userData.Dept]);

  // Compute counts for Priority breakdown
  const computePriorityCounts = () => {
    let high = 0,
      medium = 0,
      low = 0;
    tickets.forEach((ticket) => {
      if (ticket.Ticket_Priority) {
        const prio = ticket.Ticket_Priority.toLowerCase();
        if (prio === "high") high++;
        else if (prio === "medium") medium++;
        else if (prio === "low") low++;
      }
    });
    return { high, medium, low };
  };

  // Compute counts for Status breakdown
  const computeStatusCounts = () => {
    let inProgress = 0,
      resolved = 0,
      closed = 0,
      overdue = 0;
    tickets.forEach((ticket) => {
      if (ticket.TStatus) {
        const status = ticket.TStatus.toLowerCase();
        if (status === "in-progress") inProgress++;
        else if (status === "resolved") resolved++;
        else if (status === "closed") closed++;
        else if (status === "overdue") overdue++;
      }
    });
    const total = tickets.length;
    return { inProgress, resolved, closed, overdue, total };
  };

  const priorityCounts = computePriorityCounts();
  const statusCounts = computeStatusCounts();

  const priorityBarData = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        label: "Tickets by Priority",
        data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
        backgroundColor: ["#FF6D6D", "#FFDD00", "#61B847"],
      },
    ],
  };

  const priorityPieData = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
        backgroundColor: ["#FF6D6D", "#FFDD00", "#61B847"],
      },
    ],
  };

  const statusBarData = {
    labels: ["In-Progress", "Resolved", "Closed", "Overdue", "Total"],
    datasets: [
      {
        label: "Tickets by Status",
        data: [
          statusCounts.inProgress,
          statusCounts.resolved,
          statusCounts.closed,
          statusCounts.overdue,
          statusCounts.total,
        ],
        backgroundColor: ["#0F6AB0", "#61B847", "#F57C00", "#FF6D6D", "#888888"],
      },
    ],
  };

  const statusPieData = {
    labels: ["In-Progress", "Resolved", "Closed", "Overdue", "Total"],
    datasets: [
      {
        data: [
          statusCounts.inProgress,
          statusCounts.resolved,
          statusCounts.closed,
          statusCounts.overdue,
          statusCounts.total,
        ],
        backgroundColor: ["#0F6AB0", "#61B847", "#F57C00", "#FF6D6D", "#888888"],
      },
    ],
  };

  return (
    <div>
      <Container>
        <Sidebar activeTab="Dashboard" />
        <Content>
          <DashboardTitle>Dashboard</DashboardTitle>
          {tabs.length > 1 && (
            <TabsContainer>
              {tabs.map((tab, index) => (
                <TabButton
                  key={index}
                  active={currentTab && currentTab.mode === tab.mode}
                  onClick={() => setCurrentTab(tab)}
                >
                  {tab.label}
                </TabButton>
              ))}
            </TabsContainer>
          )}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <ChartContainer>
                <ChartWrapper>
                  <ChartTitleStyled>Priority Breakdown (Bar)</ChartTitleStyled>
                  <ChartDescription>
                    Percentage of tickets that are High, Medium, and Low Priority.
                  </ChartDescription>
                  <ChartCanvasWrapper style={{ height: "300px" }}>
                    <Bar
                      data={priorityBarData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "top" } },
                      }}
                    />
                  </ChartCanvasWrapper>
                </ChartWrapper>
                <ChartWrapper>
                  <ChartTitleStyled>Priority Breakdown (Pie)</ChartTitleStyled>
                  <ChartDescription>
                    Distribution of tickets by priority level.
                  </ChartDescription>
                  <ChartCanvasWrapper style={{ height: "300px" }}>
                    <Pie
                      data={priorityPieData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "bottom" } },
                      }}
                    />
                  </ChartCanvasWrapper>
                </ChartWrapper>
              </ChartContainer>
              <ChartContainer>
                <ChartWrapper>
                  <ChartTitleStyled>Tickets Status Overview (Bar)</ChartTitleStyled>
                  <ChartDescription>
                    Breakdown of ticket statuses: In-Progress, Resolved, Closed, Overdue, and Total.
                  </ChartDescription>
                  <ChartCanvasWrapper style={{ height: "300px" }}>
                    <Bar
                      data={statusBarData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "top" } },
                      }}
                    />
                  </ChartCanvasWrapper>
                </ChartWrapper>
                <ChartWrapper>
                  <ChartTitleStyled>Tickets Status Overview (Pie)</ChartTitleStyled>
                  <ChartDescription>
                    Distribution of tickets by status.
                  </ChartDescription>
                  <ChartCanvasWrapper style={{ height: "300px" }}>
                    <Pie
                      data={statusPieData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "bottom" } },
                      }}
                    />
                  </ChartCanvasWrapper>
                </ChartWrapper>
              </ChartContainer>
            </>
          )}
        </Content>
      </Container>
    </div>
  );
};

export default Dashboard;
