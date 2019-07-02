import React from 'react'
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar bg-dark">
            <h1>
                <Link to='/'>
                    <i className="fas fa-film" />Cinema24
                </Link>
            </h1>
            <ul>
                <li>
                    <Link to='/about'>Profile</Link>
                </li>
                <li>
                    <Link to='/register'>Register</Link>
                </li>
                <li>
                    <Link to='/login'>Login</Link>
                </li>
                <li>Busqueda</li>
            </ul>
        </nav>
    )
}

export default Navbar;
