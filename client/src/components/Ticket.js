import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = window.location.origin;

// Updated Container: flex-direction is now always row.
const Container = styled.div`
  display: flex;
  min-height: calc(100vh - 70px); /* Adjust for header height */
  background: linear-gradient(to bottom right, #f0f4f8, #d9e2ec);
`;

const TitleInput = styled.input`
  margin: 10px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 400px;

  @media (max-width: 768px) {
    width: 80%;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 40px;
  box-sizing: border-box;
  width: 100%;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    width: auto;
    margin: 40px;
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: 36px;
  color: #0f6ab0;
  margin-bottom: 10px;
  font-weight: 700;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 16px;
  color: #555;
  margin-bottom: 30px;
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const InputRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Input = styled.input`
  padding: 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
  max-width: 250px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: #0f6ab0;
    box-shadow: 0 0 6px rgba(15, 106, 176, 0.2);
    outline: none;
  }
`;

const Select = styled.select`
  padding: 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
  max-width: 260px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: #0f6ab0;
    box-shadow: 0 0 6px rgba(15, 106, 176, 0.2);
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 90%;
  max-width: 800px;
  height: 150px;
  margin: 20px 0;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  resize: vertical;
`;

const SubmitButton = styled.button`
  background-color: #0f6ab0;
  color: #ffffff;
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 20px;
`;

const Message = styled.p`
  color: ${({ success }) => (success ? "green" : "red")};
  text-align: center;
  font-size: 16px;
  margin-top: 20px;
`;

const CreateTicketPage = () => {
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [taskLabels, setTaskLabels] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSubDepartment, setSelectedSubDepartment] = useState("");
  const [selectedSubTask, setSelectedSubTask] = useState("");
  const [selectedTaskLabel, setSelectedTaskLabel] = useState("");

  const [ticketTitle, setTicketTitle] = useState("");

  const [ticketPriority, setTicketPriority] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");

  const [attachments, setAttachments] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the logged-in user's username from localStorage
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      // If no user is logged in, redirect to login page
      navigate("/login");
    } else {
      setReporterEmail(storedUsername);
    }
  }, [navigate]);

  // Fetch departments on component mount
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/departments`)
      .then((response) => {
        setDepartments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, []);

  // Fetch subdepartments when department changes
  useEffect(() => {
    if (selectedDepartment) {
      axios
        .get(
          `${API_BASE_URL}/api/subdepartments?department=${selectedDepartment}`
        )
        .then((response) => {
          setSubDepartments(response.data);
        })
        .catch((error) => {
          console.error("Error fetching subdepartments:", error);
        });
    } else {
      setSubDepartments([]);
    }
    // Reset dependent fields
    setSubTasks([]);
    setTaskLabels([]);
    setSelectedSubDepartment("");
    setSelectedSubTask("");
    setSelectedTaskLabel("");
  }, [selectedDepartment]);

  // Fetch subtasks when subdepartment changes
  useEffect(() => {
    if (selectedDepartment && selectedSubDepartment) {
      axios
        .get(
          `${API_BASE_URL}/api/subtasks?department=${selectedDepartment}&subdepartment=${selectedSubDepartment}`
        )
        .then((response) => {
          setSubTasks(response.data);
        })
        .catch((error) => {
          console.error("Error fetching subtasks:", error);
        });
    } else {
      setSubTasks([]);
    }
    // Reset dependent fields
    setTaskLabels([]);
    setSelectedSubTask("");
    setSelectedTaskLabel("");
  }, [selectedSubDepartment, selectedDepartment]);

  // Fetch task labels when subtask changes
  useEffect(() => {
    if (selectedDepartment && selectedSubDepartment && selectedSubTask) {
      axios
        .get(
          `${API_BASE_URL}/api/tasklabels?department=${selectedDepartment}&subdepartment=${selectedSubDepartment}&subtask=${selectedSubTask}`
        )
        .then((response) => {
          setTaskLabels(response.data);
        })
        .catch((error) => {
          console.error("Error fetching task labels:", error);
        });
    } else {
      setTaskLabels([]);
    }
    setSelectedTaskLabel("");
  }, [selectedSubTask, selectedSubDepartment, selectedDepartment]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure reporterEmail is available
    if (!reporterEmail) {
      setErrorMessage("User not logged in. Please log in again.");
      return;
    }

    // Create a FormData object and append all text fields
    const formData = new FormData();
    formData.append("title", ticketTitle);
    formData.append("department", selectedDepartment);
    formData.append("subDepartment", selectedSubDepartment);
    formData.append("subTask", selectedSubTask);
    formData.append("taskLabel", selectedTaskLabel);
    formData.append("priority", ticketPriority);
    formData.append("description", ticketDescription);
    formData.append("reporterEmail", reporterEmail);

    // Append each attachment if provided (allowing multiple files)
    if (attachments) {
      for (let i = 0; i < attachments.length; i++) {
        formData.append("attachments", attachments[i]);
      }
    }

    axios
      .post(`${API_BASE_URL}/api/create-ticket`, formData)
      .then((response) => {
        setSuccessMessage(
          "Your ticket was created successfully and auto-assigned, please check your inbox for a confirmation email!"
        );
        setErrorMessage("");

        // Clear form fields
        setTicketTitle("");
        setSelectedDepartment("");
        setSelectedSubDepartment("");
        setSelectedSubTask("");
        setSelectedTaskLabel("");
        setTicketPriority("");
        setTicketDescription("");
        setAttachments(null);

        // Clear dependent fields
        setSubDepartments([]);
        setSubTasks([]);
        setTaskLabels([]);
      })
      .catch((error) => {
        setErrorMessage(
          "An error occurred while creating the ticket. Please try again."
        );
        setSuccessMessage("");
        console.error("Error creating ticket:", error);
      });
  };

  return (
    <div>
      <Container>
        <Sidebar activeTab="Create Ticket" />
        <Content>
          <Title>Create New Ticket</Title>
          <Subtitle>
            All fields are mandatory and must be filled before ticket submission
          </Subtitle>
          <Form onSubmit={handleSubmit}>
            <InputRow>
              <TitleInput
                type="text"
                placeholder="Ticket Title:"
                required
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
              />

              <Select
                required
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">Department:</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
              <Select
                required
                value={selectedSubDepartment}
                onChange={(e) => setSelectedSubDepartment(e.target.value)}
              >
                <option value="">Sub-Department:</option>
                {subDepartments.map((subDept, index) => (
                  <option key={index} value={subDept}>
                    {subDept}
                  </option>
                ))}
              </Select>
              <Select
                required
                value={selectedSubTask}
                onChange={(e) => setSelectedSubTask(e.target.value)}
              >
                <option value="">Category:</option>
                {subTasks.map((subTask, index) => (
                  <option key={index} value={subTask}>
                    {subTask}
                  </option>
                ))}
              </Select>
              <Select
                required
                value={selectedTaskLabel}
                onChange={(e) => setSelectedTaskLabel(e.target.value)}
              >
                <option value="">Sub-Category:</option>
                {taskLabels.map((label, index) => (
                  <option key={index} value={label}>
                    {label}
                  </option>
                ))}
              </Select>
              <Select
                required
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
              >
                <option value="">Ticket Priority:</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            </InputRow>
            <TextArea
              placeholder="Ticket Description:"
              required
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
            ></TextArea>

            <div style={{ margin: "10px 0" }}>
              <label style={{ marginRight: "10px" }}>Attachments:</label>
              <input
                type="file"
                name="attachments"
                onChange={(e) => setAttachments(e.target.files)}
                multiple
              />
            </div>

            <SubmitButton type="submit">Create Ticket</SubmitButton>
          </Form>
          {successMessage && (
            <Message success>{successMessage}</Message>
          )}
          {errorMessage && (
            <Message>{errorMessage}</Message>
          )}
        </Content>
      </Container>
    </div>
  );
};

export default CreateTicketPage;