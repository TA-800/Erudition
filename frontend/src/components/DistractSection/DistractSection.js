import React, { useContext, useEffect, useRef, useState } from "react";
import randomWords from "random-words";
import Stateless from "../Utilities/Stateless";
import he from "he";
import moreContext from "../../context/moreContext";

export default function DistractSection() {
    const [content, setContent] = useState("");

    return (
        <article className="distract">
            {/* Left panel */}
            <div className="lp">
                <p className="lp__title">Respite</p>
                <ul className="lp__list">
                    {["Games", "Trivia", "More"].map((element) => (
                        <li
                            key={element}
                            className="course-button"
                            onClick={(e) => {
                                e.currentTarget.parentNode.childNodes.forEach((child) => {
                                    child.className = "course-button";
                                });
                                e.currentTarget.className = "course-button course-button-active";
                                setContent(element);
                            }}>
                            {element}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right panel */}
            <div className="rp">
                <div className="rp__content">
                    {content === "Games" ? (
                        <Games />
                    ) : content === "Trivia" ? (
                        <Trivia />
                    ) : content === "More" ? (
                        <Misc />
                    ) : (
                        <Stateless contents="Select a section to check out" />
                    )}
                </div>
            </div>
        </article>
    );
}

function Games() {
    const [game, setGame] = useState("Hangman");

    function Hangman() {
        const [word, setWord] = useState(
            randomWords({
                exactly: 1,
                minLength: 6,
                maxLength: 10,
            })[0]
        );
        let hint = word[Math.floor(Math.random() * word.length)];
        const [informed, setInformed] = useState(word.split("").map((letter) => (letter === hint ? letter : "_")));
        const [guessed, setGuessed] = useState([hint]);
        const [wrong, setWrong] = useState(0);
        const maxWrong = 6;

        function onLetterClick(e) {
            const guessedLetter = e.currentTarget.textContent.toLowerCase();
            if (word.includes(guessedLetter)) {
                const string = word.split("").map((letter) => ([...guessed, guessedLetter].includes(letter) ? letter : "_"));
                if (!string.includes("_")) endGame("v");
                setInformed(string);
            } else {
                setWrong(wrong + 1);
                if (wrong + 1 === maxWrong) {
                    endGame("d");
                }
            }
            setGuessed([...guessed, guessedLetter]);
        }

        function reset() {
            const newWord = randomWords({
                exactly: 1,
                minLength: 6,
                maxLength: 10,
            })[0];
            hint = newWord[Math.floor(Math.random() * newWord.length)];
            setWord(newWord);
            setInformed(newWord.split("").map((letter) => (letter === hint ? letter : "_")));
            setGuessed([hint]);
            setWrong(0);
        }

        function endGame(outcome) {
            setWrong(outcome === "v" ? "Victory!" : "Defeat! Word: " + word);
        }

        function reveal(e) {
            endGame("d");
        }

        return (
            <div className="flex flex-col p-2 gap-y-2 bg-zinc-600">
                <div className="flex flex-row mdc:flex-col mdc:gap-y-1 text-2xl">
                    <strong>{informed.join(" ")}</strong>
                    <span className="ml-auto mdc:ml-0">
                        {wrong}
                        {typeof wrong === "number" ? `\\${maxWrong}` : ""}
                    </span>
                </div>
                <div className="grid gap-1 sm:gap-y-2 grid-cols-[repeat(13,minmax(0,1fr))] sm:grid-cols-10">
                    {"abcdefghijklmnopqrstuvwxyz".split("").map((letter) => {
                        return (
                            <button
                                key={letter}
                                className={
                                    "btn-dark flex justify-center items-center" + (guessed.includes(letter) ? " disabled" : "")
                                }
                                onClick={(e) => onLetterClick(e)}
                                disabled={guessed.includes(letter) || typeof wrong !== "number"}>
                                {letter.toUpperCase()}
                            </button>
                        );
                    })}
                </div>
                <div className="grid grid-cols-2 gap-x-2">
                    <button className="btn-dark" onClick={reset}>
                        NEW
                    </button>
                    <button
                        className={"btn-dark" + (typeof wrong !== "number" ? " disabled" : "")}
                        onClick={reveal}
                        disabled={typeof wrong !== "number"}>
                        REVEAL
                    </button>
                </div>
            </div>
        );
    }

    function Snake() {
        // Coming soon :)
        return <Stateless contents="Snake coming soon :)" />;
    }

    function TicTacToe() {
        // Coming soon :)
        return <Stateless contents="Tictactoe coming soon :)" />;
    }

    return (
        <>
            <div className="flex flex-row justify-around my-2 p-2 gap-1">
                {["Hangman", "TicTacToe", "Snake"].map((game) => {
                    return (
                        <button
                            key={game}
                            className="btn-dark w-full"
                            onClick={() => {
                                setGame(game);
                            }}>
                            {game}
                        </button>
                    );
                })}
            </div>
            {game === "Hangman" ? <Hangman /> : game === "TicTacToe" ? <TicTacToe /> : <Snake />}
        </>
    );
}

function Trivia() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reset, setReset] = useState(false);

    useEffect(() => {
        setLoading(true);
        const abort = new AbortController();

        fetch("https://opentdb.com/api.php?amount=4&difficulty=easy", { signal: abort.signal })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Error, try refreshing");
                }
                return res.json();
            })
            .then((data) => {
                setQuestions(data.results);
                setLoading(false);
            })
            .catch((err) => console.log(err));

        return () => abort.abort();
    }, [reset]);

    function handleAnswerClick(e, correct) {
        // Color the button green if correct, red if incorrect, gray to all other buttons
        const buttons = e.currentTarget.parentElement.children;

        Array.from(buttons).forEach((button) => {
            if (button.textContent === he.unescape(correct)) {
                button.classList.add("bg-green-600");
            } else if (button === e.currentTarget) {
                button.classList.add("bg-red-600");
            } else {
                button.classList.add("bg-gray-600");
            }

            button.disabled = true;
        });
    }

    function Loading() {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-1 pt-3">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-zinc-500"></div>
                <p className="info-text">Loading some fun questions!</p>
            </div>
        );
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <div className="p-1 text-right">
                <span onKeyDown={handleKeyDown} onClick={() => setReset(!reset)} tabIndex={0} className="link">
                    Reset?
                </span>
            </div>
            <div className="flex flex-col gap-2 p-2 bg-zinc-600">
                {questions.map((question) => {
                    return (
                        <div key={question.question}>
                            <h3>{he.unescape(question.question)}</h3>
                            <div className="grid grid-flow-col grid-cols-4 gap-1 sm:grid-flow-row sm:grid-cols-none">
                                {[...question.incorrect_answers, question.correct_answer]
                                    .map((answer) => ({
                                        answer,
                                        sort: Math.random(),
                                    }))
                                    .sort((a, b) => a.sort - b.sort)
                                    .map(({ answer }) => {
                                        return (
                                            <button
                                                key={answer}
                                                onClick={(e) => handleAnswerClick(e, question.correct_answer)}
                                                className="btn-dark">
                                                {he.unescape(answer)}
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

function Misc() {
    const [option, setOption] = useState("Quote");

    function WordSearch() {
        let words = [];
        const [stateWords, setStateWords] = useState(words);
        const [reset, setReset] = useState(false);
        const searchWrapper = useRef(null);

        function getRandomLetter() {
            return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
        }

        function createWordSearch(words) {
            // 10x10 2D array
            const size = 10;
            const filler = "_";
            let grid = Array.from({ length: size }, () => Array.from({ length: size }, () => filler));
            const directions = ["up", "down", "left", "right", "up-left", "up-right", "down-left", "down-right"];

            const getRandomInt = (min, max) => {
                min = Math.ceil(min);
                max = Math.floor(max);
                // Both min and max are inclusive
                return Math.floor(Math.random() * (max - min + 1) + min);
            };
            const placeWord = (grid, word, startX, startY, directionX, directionY) => {
                for (let i = 0; i < word.length; i++) {
                    if (
                        grid[startY + i * directionY][startX + i * directionX] !== word[i] &&
                        grid[startY + i * directionY][startX + i * directionX] !== filler
                    ) {
                        return false;
                    }
                }

                for (let i = 0; i < word.length; i++) {
                    grid[startY + i * directionY][startX + i * directionX] = word[i];
                }

                return true;
            };
            const checkUpAndLeft = (size, word) => {
                // return random number between len(word)-1 and size-1
                return getRandomInt(word.length - 1, size - 1);
            };
            const checkDownAndRight = (size, word) => {
                // return random number between 0 and size-len(word)
                return getRandomInt(0, size - word.length);
            };

            words.forEach((word) => {
                while (true) {
                    let direction = directions[getRandomInt(0, directions.length - 1)];
                    let startX, startY, success;

                    if (direction === "up") {
                        startY = checkUpAndLeft(size, word);
                        startX = getRandomInt(0, size - 1);
                        success = placeWord(grid, word, startX, startY, 0, -1);
                    } else if (direction === "left") {
                        startX = checkUpAndLeft(size, word);
                        startY = getRandomInt(0, size - 1);
                        success = placeWord(grid, word, startX, startY, -1, 0);
                    } else if (direction === "down") {
                        startY = checkDownAndRight(size, word);
                        startX = getRandomInt(0, size - 1);
                        success = placeWord(grid, word, startX, startY, 0, 1);
                    } else if (direction === "right") {
                        startX = checkDownAndRight(size, word);
                        startY = getRandomInt(0, size - 1);
                        success = placeWord(grid, word, startX, startY, 1, 0);
                    } else if (direction === "up-left") {
                        startY = checkUpAndLeft(size, word);
                        startX = checkUpAndLeft(size, word);
                        success = placeWord(grid, word, startX, startY, -1, -1);
                    } else if (direction === "up-right") {
                        startY = checkUpAndLeft(size, word);
                        startX = checkDownAndRight(size, word);
                        success = placeWord(grid, word, startX, startY, 1, -1);
                    } else if (direction === "down-left") {
                        startY = checkDownAndRight(size, word);
                        startX = checkUpAndLeft(size, word);
                        success = placeWord(grid, word, startX, startY, -1, 1);
                    } else if (direction === "down-right") {
                        startY = checkDownAndRight(size, word);
                        startX = checkDownAndRight(size, word);
                        success = placeWord(grid, word, startX, startY, 1, 1);
                    }

                    if (success) break;
                }
            });

            const placeGrid = (grid) => {
                // Place grid in DOM
                let gridWrapper = searchWrapper.current;
                // Clear grid
                gridWrapper.innerHTML = "";
                grid.forEach((row, ri) => {
                    row.forEach((letter, ci) => {
                        const div = document.createElement("div");
                        div.className =
                            "letter-cell flex justify-center items-center text-2xl border-2 border-white border-opacity-25";
                        div.setAttribute("data-letterIndex", ri * size + ci);
                        div.setAttribute("data-isAnAnswer", "false");
                        if (letter === filler) {
                            div.textContent = getRandomLetter();
                        } else {
                            div.textContent = letter;
                            div.classList.add("underline");
                            div.setAttribute("data-isAnAnswer", "true");
                        }
                        gridWrapper.appendChild(div);
                    });
                });
            };
            placeGrid(grid);
        }

        useEffect(() => {
            let localRef = searchWrapper.current ? searchWrapper.current : null; // To prevent error on return/cleanup function
            words = randomWords({ exactly: 3, maxLength: 10 });
            setStateWords(words);
            createWordSearch(words);

            // Drag behavior
            let drag = false;
            let selectedCells = [];
            let wordsFound = 0;

            const handleDragStart = (e) => {
                drag = true;
                selectedCells = [];
            };

            // Mouse drag
            const handleDragMove = (e) => {
                if (drag && e.target.classList.contains("letter-cell")) {
                    let index = e.target.getAttribute("data-letterIndex");
                    if (!selectedCells.includes(index)) {
                        selectedCells.push(index);
                        e.target.classList.add("bg-blue-500");
                    }
                }
            };

            // Touch drag
            const handleTouchMove = (e) => {
                let target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
                if (drag && target.classList.contains("letter-cell")) {
                    let index = target.getAttribute("data-letterIndex");
                    if (!selectedCells.includes(index)) {
                        selectedCells.push(index);
                        target.classList.add("bg-blue-500");
                    }
                }
            };

            const handleDragEnd = (e) => {
                drag = false;
                let selectedWord = "";
                selectedCells.forEach((index) => {
                    selectedWord += searchWrapper.current.children[index].textContent;
                });
                // Remove the highlight color
                searchWrapper.current.querySelectorAll(".bg-blue-500").forEach((el) => {
                    el.classList.remove("bg-blue-500");
                });
                // Check the pattern of the indices in the selectedCells array
                // If it's a straight line, then each cell should have a difference of 1
                // Example: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                // If it's a horizontal line, then each cell should have a difference of 10
                // Example: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
                // If it's a diagonal line, then each cell should either have a difference of 11 or 9
                // Example 1: [0, 11, 22, 33, 44, 55, 66, 77, 88, 99]
                // Example 2: [9, 18, 27, 36, 45, 54, 63, 72, 81, 90]
                // If the pattern is not one of these, then the user has selected a random pattern of cells, and we should return
                let diffSet = new Set();
                for (let i = 0; i < selectedCells.length - 1; i++) {
                    // absolute diff
                    let diff = Math.abs(selectedCells[i] - selectedCells[i + 1]);
                    diffSet.add(diff);
                    // Add diff to a set
                    // If the set has more than 2 elements, then the user has selected a random pattern of cells
                    if (diffSet.size > 2) return;
                    // Last check: the selected letter must also have isAnAnswer = true
                    if (searchWrapper.current.children[selectedCells[i]].getAttribute("data-isAnAnswer") === "false") return;
                    // Check the last cell on the last iteration
                    if (i === selectedCells.length - 2) {
                        if (searchWrapper.current.children[selectedCells[i + 1]].getAttribute("data-isAnAnswer") === "false")
                            return;
                    }
                }

                if (words.includes(selectedWord) || words.includes(selectedWord.split("").reverse().join(""))) {
                    selectedCells.forEach((index) => {
                        searchWrapper.current.children[index].classList.add("bg-green-800");
                    });
                    wordsFound++;
                    if (wordsFound === words.length) {
                        setTimeout(() => {
                            alert("You found all the words!");
                            setReset((prev) => !prev);
                        }, 300);
                    }
                }
            };

            localRef.addEventListener("mousedown", handleDragStart);
            localRef.addEventListener("mousemove", handleDragMove);
            localRef.addEventListener("mouseup", handleDragEnd);

            // Mobile devices: mouse -> touch
            localRef.addEventListener("touchstart", handleDragStart);
            localRef.addEventListener("touchmove", handleTouchMove);
            localRef.addEventListener("touchend", handleDragEnd);

            return () => {
                localRef.removeEventListener("mousedown", handleDragStart);
                localRef.removeEventListener("mousemove", handleDragMove);
                localRef.removeEventListener("mouseup", handleDragEnd);

                // Mobile devices: mouse -> touch
                localRef.removeEventListener("touchstart", handleDragStart);
                localRef.removeEventListener("touchmove", handleTouchMove);
                localRef.removeEventListener("touchend", handleDragEnd);
            };
        }, [reset]);

        return (
            <>
                <div className="flex flex-row">
                    <span>
                        Locate the following words:{" "}
                        {stateWords.map((word) => {
                            return (
                                <strong className="text-lg" key={word}>
                                    {word}{" "}
                                </strong>
                            );
                        })}
                    </span>
                    <span className="ml-auto">
                        <span onKeyDown={handleKeyDown} tabIndex={0} className="link-light" onClick={() => setReset(!reset)}>
                            Reset?
                        </span>
                    </span>
                </div>
                <div className="grid grid-cols-10 grid-rows-10 gap-2 sm:gap-1 select-none touch-none" ref={searchWrapper}></div>
            </>
        );
    }

    function Quote() {
        const { quote, setQuote } = useContext(moreContext);

        useEffect(() => {
            const abort = new AbortController();

            fetch("https://quotes.rest/qod?language=en", {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
                signal: abort.signal,
            })
                .then((res) => {
                    if (res.status !== 200) {
                        return res.json().then((json) => {
                            throw new Error(JSON.stringify(json.error));
                        });
                    }
                    return res.json();
                })
                .then((data) => setQuote([data.contents.quotes[0].quote, data.contents.quotes[0].author]))
                .catch((err) => {
                    console.log(err.message);
                });

            return () => abort.abort(); // Abort fetch on unmount
        }, []);

        return (
            <div className="flex flex-col">
                {quote.length === 0
                    ? "Fetching a cool quote..."
                    : quote.map((text, index) => (
                          <p key={index} className={index === 0 ? "text-2xl font-semibold" : "italic ml-auto"}>
                              {text}
                          </p>
                      ))}
            </div>
        );
    }

    function Joke() {
        const [joke, setJoke] = useState({});
        const [reset, setReset] = useState(false);
        const [allowOffensive, setAllowOffensive] = useState(false);

        useEffect(() => {
            let url = "https://v2.jokeapi.dev/joke/Any";
            if (!allowOffensive) url += "?blacklistFlags=nsfw,religious,political,racist,sexist,explicit";
            console.log(url);

            fetch(url)
                .then((res) => {
                    if (!res.ok) throw new Error("Error, try refreshing");
                    return res.json();
                })
                .then((data) => {
                    console.log("Received data:");
                    console.log(data);
                    setJoke(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }, [reset]);

        return (
            <div className="flex flex-col gap-2">
                <p className="text-2xl font-semibold">{joke.type === "twopart" ? joke.setup : joke.joke}</p>
                <p className="italic text-xl ml-auto">{joke.delivery}</p>
                <div className="flex flex-row">
                    <div>
                        <input
                            type="checkbox"
                            id="offensive"
                            name="offensive"
                            checked={allowOffensive}
                            onChange={() => setAllowOffensive(!allowOffensive)}
                        />
                        <span> Allow dark jokes</span>
                    </div>
                    <span onKeyDown={handleKeyDown} tabIndex={0} className="link-light ml-auto" onClick={() => setReset(!reset)}>
                        Another one?
                    </span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-row justify-around my-2 p-2 gap-1">
                {["Word Search", "Quote", "Joke"].map((element) => {
                    return (
                        <button key={element} className="btn-dark w-full" onClick={() => setOption(element)}>
                            {element}
                        </button>
                    );
                })}
            </div>
            <div className="bg-zinc-600 p-2">
                {option === "Word Search" ? <WordSearch /> : option === "Joke" ? <Joke /> : <Quote />}
            </div>
        </>
    );
}

function handleKeyDown(e) {
    // If key was enter or spacebar, simulate click on that element
    if (e.key === "Enter" || e.key === " ") {
        e.target.click();
    }
}
