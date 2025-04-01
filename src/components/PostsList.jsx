import Post from "./Post";
import styles from "./PostsList.module.css";
import NewPost from "./NewPost";
import Modal from "./Modal";
import { useState } from "react";
import post from "./Post";

function PostsList({isPostModalVisible, onModalHandler}) {

    const [posts, setPosts] = useState([]);

    function addPostHandler(postData) {
        setPosts((existingPosts) => [postData, ...existingPosts]);
    }

    return <>
        {isPostModalVisible ?
        <Modal onClose={onModalHandler}>
            <NewPost
                onCancel={onModalHandler}
                onAddPost={addPostHandler}
            />
        </Modal> : null}

        {posts.length > 0 ?
        <ul className={styles.posts}>
            {posts.map((post) => <Post key={post.body} author={post.author} body={post.body}></Post>)}
    </ul> : null}
        {posts.length === 0 && (
            <div style={{textAlign: 'center', color: "red"}}>
                <h2>No posts yet</h2>
                <p>Start adding some!!!!!!</p>
            </div> )}
        </>
}

export default PostsList;