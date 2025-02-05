import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftLogo from '../assets/spot.svg';
import RightLogo from '../assets/logo-right.png';

const HeaderContainer = styled.div`
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  z-index: 1000;
  top: 0;
  padding: 10px 20px;
`;

const LeftSection = styled.div`
  position: relative; /* Allow child elements to be positioned absolutely */
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const LeftLogoStyled = styled.img`
  position: absolute; /* Position the logo relative to the LeftSection */
  left: 0; /* Align to the left */
  top: 0;
  z-index: 1001;
  transform: translateY(-50%); /* Center vertically */
  height: 300px; /* Larger size for the logo */
`;

const RightLogoStyled = styled.img`
  height: 50px;
  cursor: pointer;
`;

const Title = styled.h3`
  color: white; 
  margin-left: 7px; 
  font-family: 'Montserrat', sans-serif; 
`;

const Header = () => {
  const navigate = useNavigate();

  const handleLeftLogoClick = () => {
    navigate('/profile');
  };

  const handleRightLogoClick = () => {
    window.location.href = 'https://premierenergies.com';
  };

  return (
    <HeaderContainer>
      <LeftSection onClick={handleLeftLogoClick}>
        <LeftLogoStyled src={LeftLogo} alt="Left Logo" />
      </LeftSection>
      <RightLogoStyled src={RightLogo} alt="Right Logo" onClick={handleRightLogoClick} />
    </HeaderContainer>
  );
};

export default Header;
