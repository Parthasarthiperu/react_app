import { createContext,useState,useEffect } from "react";
import useWindowSize from "../hooks/useWindowSize";
import useAxiosFetch from "../hooks/useAxiosFetch";
import api from "../api/post";
import {format} from "date-fns";
import {useNavigate } from "react-router-dom";

const DataContext = createContext({})

export const DataProvider = ({children}) =>{

    const [posts, setPosts] = useState([])
    const [search,setSearch] = useState('')
    const [searchResults,setSearchResults] = useState([])
    const [postBody,setPostBody] = useState('')
    const [postTitle,setPostTitle] = useState('')
    const [editBody,setEditBody] = useState('')
    const [editTitle,setEditTitle] = useState('')
    const navigate = useNavigate()
    const {width} = useWindowSize()
    const {data,fetchError,isLoading} = useAxiosFetch('http://localhost:3000/posts')

    useEffect(()=>{
        setPosts(Array.isArray(data) ? data : []);
    },[data])

    useEffect(() => {
        const filteredResults = posts.filter(
            (post) =>
                (post.body?.toLowerCase()?.includes(search.toLowerCase()) || 
                post.title?.toLowerCase()?.includes(search.toLowerCase()))
        );
        setSearchResults(filteredResults.reverse());
    }, [posts, search]);

    const handleDelete = async (id) => {
        console.log(id)
        try{
        await api.delete(`/posts/${id}`); 
        const postsList = posts.filter(post => post.id !== id);
        setPosts(postsList);
        navigate('/')
        } catch(err){
        console.log(`Error: ${err.message}`)
        }
        }

    const handleEdit = async(id)=>{
        const datetime = format(new Date(),'MMMM dd, yyyy pp')
        const updatePost = {id,title:editTitle,datetime,body:editBody}
        try {
        const response = await api.put(`/posts/${id}`,updatePost)
        setPosts(posts.map(post => post.id===id ? {...response.data}:post))
        setEditTitle('')
        setEditBody('')
        navigate('/')
        } catch (err) {
        console.log(`Error: ${err.message}`)
        }
    }
    

    const handleSubmit= async(e) =>{
        e.preventDefault();
        const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
        const datetime = format(new Date(),'MMMM dd, yyyy pp')
        const newPost = {id,title:postTitle,datetime,body:postBody}
        try{
        const response = await api.post('/posts',newPost)
        console.log('Response:', response.data);

        const allPosts = [...posts,response.data]
        setPosts(allPosts)
        setPostTitle('')
        setPostBody('')
        navigate('/')
        }catch (err) {
            console.log(`Error: ${err.message}`)
        }
    }

    return(
        <DataContext.Provider value={{
            width,search,setSearch,searchResults,fetchError,isLoading,handleSubmit,postBody,postTitle,setPostBody,setPostTitle,handleEdit,editBody,setEditBody,editTitle,setEditTitle,posts,handleDelete
        }}>
            {children}
        </DataContext.Provider>
    )
}

export default DataContext