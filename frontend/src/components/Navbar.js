import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMediaPredicate } from "react-media-hook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const isSmall = useMediaPredicate("(max-width: 814px)");

    useEffect(() => {
        if (!isSmall) {
            // Force close mini navbar when screen is large
            document.querySelector(".mini-navbar").classList.remove("active");
            document.querySelector(".mini-navbar-top").classList.remove("active");
            // Force remove the overlay if it exists
            document.querySelector(".overlay").classList.remove("active");
        }
    }, [isSmall]);

    return (
        <nav>
            <ul className="navbar">
                <li>ERUDITION</li>
                <li
                    className={location.pathname === "/studyhub" ? "active" : ""}
                    onClick={() => {
                        navigate("/studyhub");
                    }}>
                    StudyHub
                </li>
                <li
                    className={location.pathname === "/discussions" ? "active" : ""}
                    onClick={() => {
                        navigate("/discussions");
                    }}>
                    Discussions
                </li>
                <li
                    className={location.pathname === "/settings" ? "active" : ""}
                    onClick={() => {
                        navigate("/settings");
                    }}>
                    Settings
                </li>
            </ul>
            {/* Responsive, small-screen navbar */}
            <div className="mini-navbar-top hidden"></div>
            <ul className="mini-navbar">
                <li
                    className={location.pathname === "/studyhub" ? "active" : ""}
                    onClick={() => {
                        navigate("/studyhub");
                    }}>
                    StudyHub
                </li>
                <li
                    className={location.pathname === "/discussions" ? "active" : ""}
                    onClick={() => {
                        navigate("/discussions");
                    }}>
                    Discussions
                </li>
                <li
                    className={location.pathname === "/settings" ? "active" : ""}
                    onClick={() => {
                        navigate("/settings");
                    }}>
                    Settings
                </li>
            </ul>
            {/* Icon */}
            <div
                className="hidden cursor-pointer
                        mdc:block mdc:fixed mdc:top-[0.625rem] mdc:right-[2rem] mdc:bg-zinc-500 mdc:p-[4px_8px]
                        mdc:shadow-[0px_4px_3px_0px_rgba(0,0,0,0.1)] z-[13] mdc:border-0 mdc:border-black mdc:border-opacity-25 mdc:transition-all mdc:duration-[0.15s]
                        mdc:active:scale-75 mdc:active:shadow-none mdc:active:border-[2.5px]"
                onClick={() => {
                    // Add small-active class to the navbar
                    // to toggle it
                    document.querySelector(".mini-navbar").classList.toggle("active");
                    document.querySelector(".mini-navbar-top").classList.toggle("active");
                    // Add overlay to the body
                    document.querySelector(".overlay").classList.toggle("overlay__active");
                }}
                id="mini-navbar-icon">
                <FontAwesomeIcon icon={faBars} size="2x" />
            </div>
            <div
                className="overlay"
                onClick={() => {
                    // Simulate clicking the navbar icon
                    document.querySelector("#mini-navbar-icon").click();
                }}></div>
        </nav>
    );
}
