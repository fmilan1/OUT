import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from "react-router";
import Home from './screens/Home';
import Stats from './screens/Stats';
import New from './screens/New';
import Edit from './screens/Edit';

import concertOneModified from './assets/fonts/ConcertOneModified.ttf?url';
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <>
	<style>
	    {`
		@font-face {
		    font-family: "Concert One";
		    src: url(${concertOneModified}) format("truetype");
		}
	    `}
	</style>
	<BrowserRouter>
		<Routes>
			<Route index element={<Home />} />
			<Route path='/new' element={<New />} />
			<Route path='/stats' element={<Stats />} />
			<Route path='/edit' element={<Edit />} />
		</Routes>
	</BrowserRouter>
    </>
);
