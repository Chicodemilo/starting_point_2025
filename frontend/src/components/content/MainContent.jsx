// the base defining area for the Content of the SPA. 
// This is a child of BodyContainer
// This container is the parent of ./content_elements

import React from 'react';
import './MainContent.css';
import Header from './content_elements/Header';
import Categories from './content_elements/Categories';
import Evidence from './content_elements/Evidence';
import FuckedMeter from './content_elements/FuckedMeter';

function MainContent() {
    return (
        <div className="main-content-container">
            <Header />
            <div className="panels-container">
                <div className="categories-panel"><Categories /></div>
                <div className="evidence-panel"><Evidence /></div>
                <div className="fucked-meter-panel"><FuckedMeter /></div>
            </div>
        </div>
    );
}

export default MainContent;