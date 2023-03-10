import { useState, useEffect, useRef, useMemo } from "react";
import { useContext } from "react";
// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookOpen,
    faHandPointLeft,
    faHandPointUp,
    faNoteSticky,
    faPlusCircle,
    faSearch,
    faTrash,
    faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
// Context
import AuthContext from "../../context/AuthContext";
// Components
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import Texteditor from "./Texteditor";
// Other features
import { twMerge } from "tailwind-merge";
import NewCourseModal from "./NewCourseModal";
import NewModuleModal from "./NewModuleModal";
import ReadingPanel from "./ReadingPanel";
import NewAssignment from "../Utilities/NewAssignment";
import AssignmentSelection from "../Utilities/AssignmentSelection";
import AssignmentUnit from "../Utilities/AssignmentUnit";
import Stateless from "../Utilities/Stateless";
import {
    setNewAssignments,
    splitDate,
    assignmentSelectionChange,
    clearAssignmentSelection,
} from "../Utilities/AssignmentFunctions";
import { useMediaPredicate } from "react-media-hook";
import { url } from "../Main";

export default function CoursesSection({ courses, setCourses, assignments, setAssignments }) {
    // First load to lock scrolls on overlay
    const [firstload, setFirstload] = useState(true);
    // Media query
    const isSmall = useMediaPredicate("(max-width: 814px)");
    // University info
    const [universities, setUniversities] = useState([]);
    // Content selection
    const contentSelector = useRef(null);
    // Search
    const [search, setSearch] = useState("");
    const [selectedCourse, setSelectedCourse] = useState({});
    // Modules
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState({});
    const searchedModules = useMemo(() => {
        if (!search) return modules;

        return modules.filter((module) => {
            // return true (true returns the element (complete module) into a new "filtered" array)
            // if the module notes contains the search term
            return module.module_notes.toLowerCase().includes(search.toLowerCase());
        });
    }, [search, modules]);
    // For module and course creation
    const [moduleModal, setModuleModal] = useState(false);
    const [courseModal, setCourseModal] = useState(false);

    // Assignments
    const searchedAssignments = useMemo(() => {
        const courseFilteredAssignments = assignments.filter((assignment) => assignment.assignment_course === selectedCourse.id);
        if (!search) return courseFilteredAssignments;

        return courseFilteredAssignments.filter((assignment) => {
            // return true (true returns the element (complete module) into a new "filtered" array)
            // if the assignment name contains the search term
            return assignment.assignment_name.toLowerCase().includes(search.toLowerCase());
        });
    }, [search, assignments]);
    const [createAssignment, setCreateAssignment] = useState(false);
    const [assignmentSelection, setAssignmentSelection] = useState([]);
    const [assignmentSelectionBox, setAssignmentSelectionBox] = useState(false);

    // Group all the states and setState functions together into an object to pass it easily into
    // imported assignment functions
    const allAssignmentStates = {
        assignments: assignments,
        assignmentSelection: assignmentSelection,
        assignmentSelectionBox: assignmentSelectionBox,
        setAssignments: setAssignments,
        setAssignmentSelection: setAssignmentSelection,
        setAssignmentSelectionBox: setAssignmentSelectionBox,
    };

    const [contact, setContact] = useState([]);

    const [readingPanel, setReadingPanel] = useState(false);
    const { logout } = useContext(AuthContext);

    // COURSE FETCH
    useEffect(() => {
        fetch(url + "courses/0", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("access"),
            },
        })
            .then((res) => {
                // If response is not 200 OK, throw an error
                if (res.status !== 200) {
                    return res.json().then((json) => {
                        throw new Error(`${res.status} ${res.statusText}: ${json.detail || json.username || json.password}`);
                    });
                }
                return res.json();
            })
            .then((data) => {
                setCourses(data);
            })
            .catch((errMessage) => {
                alert(errMessage);
                // Sign the user out
                logout();
            });

        // Fetch university info
        fetch(url + "university/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("access"),
            },
        })
            .then((res) => {
                if (!res.ok)
                    return res.json().then((json) => {
                        throw new Error(`${res.status} ${res.statusText}: ${json.detail}`);
                    });
                return res.json();
            })
            .then((data) => setUniversities([...data]))
            .catch((err) => console.log(err));
    }, []);

    // SCROLL LOCK UPDATES
    useEffect(() => {
        if (firstload) setFirstload(false);
        if (!firstload) document.querySelector("main").classList.toggle("scroll-lock");
    }, [moduleModal, courseModal, readingPanel]);

    function fetchData(course_id, contentType) {
        // Unselect all assignments
        clearAssignmentSelection("courses", { ...allAssignmentStates });
        // Hide the assignment selection box
        setAssignmentSelectionBox(false);

        // Fetch content from backend depending on the content selected (contentRef)
        // and add it to the rp__content element
        fetch(url + `${contentType}/${contentType === "assignments" ? 0 : course_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("access"),
            },
        })
            .then((res) => {
                // If response is not 200 OK, throw an error
                if (res.status !== 200) {
                    return res.json().then((json) => {
                        throw new Error(`${res.status} ${res.statusText} ${json.detail}`);
                    });
                }
                return res.json();
            })
            .then((data) => {
                printContentToPanel(data, contentType);
            })
            .catch((errMessage) => console.log(errMessage));
    }
    function printContentToPanel(data, contentType) {
        // Add class to rp__content
        const root = document.querySelector(".rp__content");
        root.className = "rp__content " + contentType;

        // Hide other other classes by checking if the child has the `contentType` class
        outer: for (let child of root.childNodes) {
            for (let clName of child.classList) {
                if (clName.includes(contentType)) {
                    // Remove the hidden class
                    child.classList.remove("hidden");
                    // This continue forces move onto next child
                    continue outer;
                }
            }
            // If this code is reached, the child does not have the `contentType` class
            child.classList.add("hidden");
        }

        switch (contentType) {
            case "modules":
                // Save the modules to state
                setModules(data);
                break;
            case "assignments":
                // Save the assignments to state
                setNewAssignments(data, true, { ...allAssignmentStates });
                break;
            case "contact":
                // Save the contact to state
                setContact(data);
                break;
        }
    }

    // MODULES' FUNCTIONS
    function FormattedNotes(props) {
        if (!props.delta)
            return (
                <div className="flex flex-col mdc:gap-3 justify-center items-center opacity-50 p-10">
                    <FontAwesomeIcon icon={isSmall ? faHandPointUp : faHandPointLeft} size="9x" />
                    <p className="text-2xl mdc:text-xl">Select a module to read</p>
                </div>
            );
        const delta = JSON.parse(props.delta);
        if (delta.ops.length === 1 && delta.ops[0].insert === "\n")
            return (
                <div className="flex flex-col justify-center items-center opacity-50 p-10">
                    <FontAwesomeIcon icon={faNoteSticky} size="9x" />
                    <p className="text-2xl mdc:text-xl">No notes for this module</p>
                </div>
            );
        const converter = new QuillDeltaToHtmlConverter(delta.ops, {});

        const html = converter.convert();

        return (
            <div
                className={"formatted-text-wrapper max-h-[40rem]" + (readingPanel ? props.hide : " overflow-y-auto")}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    }
    function deleteModule(id) {
        // Display confirmation dialog
        if (window.confirm("Are you sure you want to delete this module?")) {
            // Delete module
            fetch(url + `modules/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("access"),
                },
            })
                .then((resp) => {
                    // If response is not 200 OK, throw an error
                    if (resp.status !== 200) {
                        return resp.json().then((json) => {
                            throw new Error(`${resp.status} ${resp.statusText} ${json.detail}`);
                        });
                    }
                    return resp.json();
                })
                .then((data) => {
                    const moduleToDelete = document.querySelector(`[data-mkey="${id}"]`);
                    moduleToDelete.ontransitionend = (event) => {
                        if (event.propertyName !== "max-height") return;
                        // Remove the module
                        setModules(modules.filter((module) => module.id !== id));
                        // Select some other module
                        if (selectedModule.id === id && modules.length > 0) simulateModuleSelect(modules[0].id);
                    };
                    moduleToDelete.className = twMerge(moduleToDelete.className, "max-h-0 py-0");
                })
                .catch((errMessage) => {
                    alert(errMessage);
                });
        }
    }
    function deleteCourse(id) {
        // Display confirmation dialog
        if (window.confirm("Are you sure you want to delete this course?")) {
            // Delete course
            fetch(url + `courses/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("access"),
                },
            })
                .then((resp) => {
                    // If response is not 200 OK, throw an error
                    if (resp.status !== 200) {
                        return resp.json().then((json) => {
                            throw new Error(`${resp.status} ${resp.statusText} ${json.detail}`);
                        });
                    }
                    return resp.json();
                })
                .then((data) => {
                    // Remove the course
                    const courseToDelete = document.querySelector(`[data-ckey="${id}"]`);
                    courseToDelete.ontransitionend = (event) => {
                        if (event.propertyName !== "height") return;
                        setCourses(courses.filter((course) => course.id !== id));
                        // Select some other course
                        if (selectedCourse.id === id && courses.length > 0) simulateCourseSelect(courses[0].id);
                    };
                    courseToDelete.className = twMerge(courseToDelete.className, "h-0 font-normal text-xs");
                })
                .catch((errMessage) => {
                    alert(errMessage);
                });
        }
    }

    // This function simulates a click on a module/course which will also update the selected module/course
    function simulateModuleSelect(module_id = 0) {
        const moduleToSelect = document.querySelector(`[data-mkey="${module_id}"]`).childNodes[0];
        moduleToSelect.click();
    }
    function simulateCourseSelect(course_id = 0) {
        const courseToSelect = document.querySelector(`[data-ckey="${course_id}"]`);
        courseToSelect.click();
    }
    // This can be used to create a new module or update an existing module
    function setNewModules(newModuleData) {
        if (modules.find((module) => module.id === newModuleData.id)) {
            // Update existing module
            // Need to use this method to keep order of modules
            setModules(modules.map((module) => (module.id === newModuleData.id ? newModuleData : module)));
        } else {
            // Create new module
            setModules([...modules, newModuleData]);
        }
    }

    // // ASSIGNMENTS' FUNCTIONS

    // SEARCH UPDATE (for modules and assignments)
    useEffect(() => {
        if (search && contentSelector.current.value === "modules") {
            // If modules have been fetched from backend
            if (modules.length > 0) {
                // If selected module is part of searched modules, do nothing
                if (searchedModules.includes(selectedModule)) {
                } else {
                    // If selected module is not part of searched modules, and we have actual search results, set selected module to first module in searched modules
                    if (searchedModules.length > 0) {
                        simulateModuleSelect(searchedModules[0].id);
                    } else {
                        // else, if we have no search results, set selected module to empty object
                        setSelectedModule({});
                    }
                }
            }
        }
    }, [search]);

    return (
        <>
            {/* OVERLAYS BEGIN */}
            {/* Overlay panel for adding modules */}
            {moduleModal && (
                <NewModuleModal
                    className="absolute"
                    setModuleModal={setModuleModal}
                    course_id={selectedCourse.id}
                    setNewModules={setNewModules}
                />
            )}
            {/* Overlay panel for adding courses */}
            {courseModal && (
                <NewCourseModal
                    className="absolute"
                    setCourseModal={setCourseModal}
                    setCourses={setCourses}
                    universities={universities}
                />
            )}

            {/* Overlay panel for reading and editing text */}
            {readingPanel && (
                <ReadingPanel
                    className="absolute"
                    selectedModule={selectedModule}
                    setReadingPanel={setReadingPanel}
                    setSelectedModule={setSelectedModule}
                    setNewModules={setNewModules}
                    FormattedNotes={FormattedNotes}
                    Texteditor={Texteditor}
                />
            )}
            {/* OVERLAYS END */}

            <article className="courses">
                {/* Left panel */}
                <div className="lp">
                    <p className="lp__title">Courses</p>
                    <ul className="lp__list">
                        {courses.map((course) => (
                            <li
                                className="course-button"
                                data-ckey={course.id}
                                key={course.id}
                                onClick={(e) => {
                                    e.currentTarget.parentNode.childNodes.forEach((child) => {
                                        child.className = "course-button";
                                    });
                                    e.currentTarget.className = "course-button course-button-active";
                                    // Also fetch data for clicked course for selected content
                                    fetchData(course.id, contentSelector.current.value);
                                    setSelectedCourse(course);
                                    setSelectedModule({});
                                }}>
                                {course.course_code}
                                <div
                                    className="absolute right-2"
                                    onClick={() => {
                                        deleteCourse(course.id);
                                    }}>
                                    <FontAwesomeIcon
                                        icon={faTrashAlt}
                                        className="text-md cursor-pointer opacity-50 transition-all duration-200 hover:text-xl hover:opacity-90"
                                    />
                                </div>
                            </li>
                        ))}
                        <li className="course-button gap-1" onClick={() => setCourseModal(true)}>
                            <FontAwesomeIcon icon={faPlusCircle} className="opacity-90" />
                            Add course
                        </li>
                    </ul>
                </div>

                {/* Right panel */}
                <div className="rp">
                    {/* Utility bar */}
                    <div className="p-2 w-full h-fit flex flex-row gap-6 mdc:gap-1 mdc:text-sm">
                        {/* Search bar with icon */}
                        <div className="w-4/6 mdc:w-2/4 h-12 mdc:h-10 relative">
                            <input
                                type="text"
                                placeholder="Search notes"
                                className="input-text pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <FontAwesomeIcon icon={faSearch} className="absolute top-1/3 left-2 opacity-50" />
                        </div>
                        {/* Add button */}
                        <button
                            className={createAssignment || Object.keys(selectedCourse).length === 0 ? "add disabled" : "add"}
                            onClick={() => {
                                if (contentSelector.current.value === "modules") setModuleModal(true);
                                else if (contentSelector.current.value === "assignments") setCreateAssignment(true);
                            }}>
                            <FontAwesomeIcon icon={faPlusCircle} />
                        </button>
                        {/* Content selector drop-down */}
                        <select
                            onChange={() => {
                                if (selectedCourse.course_name === undefined) return;
                                fetchData(selectedCourse.id, contentSelector.current.value);
                            }}
                            ref={contentSelector}
                            className="dropdown">
                            <option value="modules">Modules</option>
                            <option value="assignments">Assign/Todo</option>
                            <option value="contact">Contact</option>
                        </select>
                    </div>

                    {/* Content panel */}
                    <div className="rp__content">
                        {/* Module List */}
                        {selectedCourse.course_name !== undefined && (
                            <div className="modules flex flex-col bg-zinc-600 p-2">
                                {searchedModules.map((module, index) => (
                                    <div
                                        className="flex flex-row gap-x-2 items-center max-h-28 border-b-2 border-white border-opacity-10 duration-500 overflow-hidden"
                                        data-mkey={module.id}
                                        key={module.id}>
                                        <div
                                            className="module-button"
                                            onClick={(e) => {
                                                e.currentTarget.parentNode.parentNode.childNodes.forEach((child) => {
                                                    child.childNodes[0].className = "module-button";
                                                });
                                                e.currentTarget.className = "module-button module-button-active";
                                                setSelectedModule(module);
                                            }}>
                                            <div className="flex flex-row gap-2 items-baseline">
                                                <span className="text-xs text-zinc-400">{index + 1}</span> {module.module_name}
                                            </div>
                                        </div>
                                        <p className="ml-auto" onClick={() => deleteModule(module.id)}>
                                            <FontAwesomeIcon
                                                className="text-xs cursor-pointer w-4 opacity-50 transition-all duration-200 hover:text-sm hover:opacity-100"
                                                icon={faTrash}
                                            />
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Module notes */}
                        <div
                            className={
                                "modules-notes-wrapper relative bg-zinc-600" +
                                (selectedCourse.course_name !== undefined ? " p-2" : " bg-opacity-0")
                            }>
                            {selectedCourse.course_name !== undefined ? (
                                <FormattedNotes delta={selectedModule.module_notesDelta} hide=" overflow-hidden" />
                            ) : (
                                <Stateless contents="Select a course to see its contents" />
                            )}

                            {/* Read button */}
                            <button
                                className="read-button"
                                style={{
                                    display: selectedModule.module_name === undefined || readingPanel ? "none" : "flex",
                                }}
                                onClick={() => {
                                    setReadingPanel(true);
                                }}>
                                <FontAwesomeIcon icon={faBookOpen} />
                            </button>
                        </div>

                        {createAssignment && (
                            <NewAssignment
                                setCreateAssignment={setCreateAssignment}
                                courses={courses}
                                selectedCourse={selectedCourse}
                                setNewAssignments={setNewAssignments}
                                allAssignmentStates={allAssignmentStates}
                            />
                        )}
                        {/* Assignments */}
                        <div className="assignments-wrapper hidden max-h-96 overflow-auto">
                            <ul className="flex flex-col w-full gap-y-3">
                                {searchedAssignments.length > 0 &&
                                    searchedAssignments
                                        .sort(
                                            (a, b) =>
                                                // Sort by completed, then by time
                                                (a.assignment_completed ? 1 : 0) - (b.assignment_completed ? 1 : 0) ||
                                                new Date(a.assignment_due_date) - new Date(b.assignment_due_date)
                                        )
                                        .map((assignment) => {
                                            return (
                                                <AssignmentUnit
                                                    key={assignment.id}
                                                    assignment={assignment}
                                                    splitDate={splitDate}
                                                    assignmentSelectionChange={assignmentSelectionChange}
                                                    allAssignmentStates={allAssignmentStates}
                                                />
                                            );
                                        })}
                                {searchedAssignments.length === 0 && <Stateless contents="No assignments to find" />}
                            </ul>
                        </div>
                        {assignmentSelectionBox && (
                            <AssignmentSelection
                                assignments={assignments}
                                assignmentSelection={assignmentSelection}
                                setAssignments={setAssignments}
                                setAssignmentSelectionBox={setAssignmentSelectionBox}
                                clearAssignmentSelection={() => {
                                    clearAssignmentSelection("courses", { ...allAssignmentStates });
                                }}
                            />
                        )}

                        {/* Contact */}
                        <div className="contact-wrapper hidden">
                            {/* Course name: code + name */}
                            <div className="grid grid-flow-row grid-cols-3 items-center gap-1 p-2 pl-4 bg-zinc-600">
                                <div className="col-span-3">
                                    <p className="text-lg font-bold">
                                        {`${contact.course_code}: ${contact.course_name}` || (
                                            <i className="opacity-50">No information found</i>
                                        )}
                                    </p>
                                </div>
                                <div className="col-span-3">
                                    <p className="opacity-75">
                                        {`${contact.course_description}` || <i className="opacity-50">No information found</i>}
                                    </p>
                                </div>
                                <p className="text-zinc-400">Instructor</p>
                                <p className="text-lg col-span-2">
                                    {contact.course_instructor || <i className="opacity-50">No information found</i>}
                                </p>
                                <p className="text-zinc-400">Contact</p>
                                <p className="text-lg col-span-2">
                                    {contact.course_instructor_contact || <i className="opacity-50">No information found</i>}
                                </p>
                                <p className="text-zinc-400">Office hrs.</p>
                                <p className="text-lg col-span-2">
                                    {contact.course_instructor_office_hours || <i className="opacity-50">No information found</i>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
}
