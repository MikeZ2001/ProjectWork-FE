import styles from './NewPost.module.css';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import {useState} from "react";

function NewPost( { onCancel, onAddPost}) {
    const [body, setBody] = useState('');
    function onBodyChangeHandler(e) {
        setBody(e.target.value);
    }

    const [author, setAuthor] = useState("");
    function onAuthorChangeHandler(e) {
        setAuthor(e.target.value);
    }

    function submitHandler(e) {
        e.preventDefault();
        const postData = {
            body: body,
            author: author
        }
        console.log(postData);
        onAddPost(postData);
        onCancel();
    }

    return (
        <form className={styles.form} onSubmit={submitHandler}>
            <p>
                <label htmlFor="body">Text</label>
               <InputTextarea onChange={onBodyChangeHandler}></InputTextarea>
            </p>
            <p>
                <label htmlFor="name">Your name</label>
                <InputText onChange={onAuthorChangeHandler}></InputText>
            </p>
            <p className={styles.actions}>
                <button type="button" onClick={onCancel}>Cancel</button>
                <button>Submit</button>
            </p>
        </form>
    );
}

export default NewPost;