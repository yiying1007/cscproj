import {useState,useEffect} from 'react';
import { UserLayout } from '../../../Layouts/ClientLayout';
import { usePage } from '@inertiajs/react';
import CreatePost from './Post/CreatePost';
import HomeIndex from './HomeIndex';
import PostByType from './Post/PostByTypes';


function Index(){

    const { publicPosts,hasMorePublicPosts,partialPost,hasMorePosts } = usePage().props;
    const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'home');
    //remember user choose tab status
    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
        return () => {
            localStorage.removeItem('activeTab');
        };
    }, [activeTab]);

    return(
        <UserLayout>
            <div className='index-navigation-container'>
                <a 
                    onClick={() => setActiveTab('home')}
                    className={activeTab === 'home' ? 'active' : ''}
                >
                    HOME
                </a>
                <a
                    onClick={() => setActiveTab('all')}
                    className={activeTab === 'all' ? 'active' : ''}
                >
                    ALL
                </a>
                <a
                    onClick={() => setActiveTab('private')}
                    className={activeTab === 'private' ? 'active' : ''}
                >
                    PRIVATE
                </a>
            </div>
            {activeTab === 'home' && (
                <>
                <HomeIndex />
                </>
            )}
            {activeTab === 'all' && (
                <>
                <PostByType 
                    postsData={publicPosts} 
                    hasMoreData={hasMorePublicPosts} 
                    fetchUrl="loadPublicPosts"
                />
                </>
            )}
            {activeTab === 'private' && (
                <>
                <PostByType 
                    postsData={partialPost} 
                    hasMoreData={hasMorePosts} 
                    fetchUrl="loadPartialPosts"
                />
                </>
            )}
            
            <CreatePost />
        </UserLayout>
        
    );
}

export default Index; 


