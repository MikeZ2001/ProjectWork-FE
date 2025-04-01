import PostsList from "./components/PostsList";
import {LoginForm} from "./components/LoginForm";
import MainHeader from "./components/MainHeader";
import {useState} from "react";

function App() {
    const [modalIsVisible, setModalIsVisible] = useState(false);

    function showModalHandler() {
        setModalIsVisible(true)
    }

    function hideModalHandler() {
        setModalIsVisible(false)
    }

    return (
        <>
            <MainHeader isModalVisible={showModalHandler}></MainHeader>
            <PostsList isPostModalVisible={modalIsVisible} onModalHandler={hideModalHandler}></PostsList>
            <LoginForm></LoginForm>
        </>


    )
}

export default App;
