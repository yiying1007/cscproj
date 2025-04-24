import React from 'react';
import { AdminLayout } from '../../../Layouts/ClientLayout';
import { usePage } from '@inertiajs/react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
    const { totalUsers, totalCommunities, totalPosts, monthlyPostCounts, monthlyUserCounts,topCommunities,hotPosts } = usePage().props;

    

    // handle monthly data
    const labels = monthlyPostCounts.map(item => `${item.year}-${String(item.month).padStart(2, "0")}`);
    const postCounts = monthlyPostCounts.map(item => item.post_count);
    const userCounts = monthlyUserCounts.map(item => item.user_count);
    
    // post data
    const postChartData = {
        labels,
        datasets: [
            {
                label: "Monthly Posts",
                data: postCounts,
                backgroundColor: "#543A14", 
                borderColor: "#543A14",
                borderWidth: 1
            }
        ]
    };

    // register data
    const userChartData = {
        labels,
        datasets: [
            {
                label: "Monthly Registered Users",
                data: userCounts,
                backgroundColor: "#543A14", 
                borderColor: "#543A14",
                borderWidth: 1
            }
        ]
    };
    // Chart Options
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
                font: {
                    size: 18,
                    weight: "bold",
                },
                padding: {
                    top: 10,
                    bottom: 10
                }
            }
        },
        scales: {
            x: {
                type: "category",
                beginAtZero: true,
                ticks: {
                    font: { size: 14 }
                },
                grid: { display: false } 
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: { size: 14 }
                },
                grid: { display: false } 
            }
        }
    };

    return (
        <div>
            <AdminLayout>
                <div className="controlbar">
                    <h5>Dashboard </h5>
                </div>
                <div className="controlbox">
                    <div className="container-fluid">
                        <div className='dashboard-cardList'>
                            <div className='card'>
                                <div className="cardcontent">
                                    <div className="totalnumber">{totalUsers}</div>
                                    <div className="cardname">Total User</div>
                                </div>
                                <i className="cardicon bi bi-person-fill"></i>
                            </div>
                            <div className='card'>
                                <div className="cardcontent">
                                    <div className="totalnumber">{totalPosts}</div>
                                    <div className="cardname">Total Post</div>
                                </div>
                                <i className="cardicon bi bi-card-heading"></i>
                            </div>
                            <div className='card'>
                                <div className="cardcontent">
                                    <div className="totalnumber">{totalCommunities}</div>
                                    <div className="cardname">Total Community</div>
                                </div>
                                <i className="cardicon bi bi-people-fill"></i>
                            </div>
                        </div>
                        <h5 className='dashboard-label'>Monthly Data Statistics</h5>
                        <div className='dashboard-chart-container'>
                            <div className='dashboard-chart'>
                                <Bar data={postChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: "Monthly Posts" } } }} />
                            </div>

                            <div className='dashboard-chart'>
                                <Bar data={userChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: "Monthly Registered Users" } } }} />
                            </div>
                        </div>
                        <div className='dashboard-table-container'> 
                            <div className='table-container'>
                            <h5 className='dashboard-label'>Top 5 Communities</h5>
                            <table className="table dashboard-table">
                                <thead className="thead-dark">
                                    <tr>
                                    <th scope="col">No</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Members</th>
                                    <th scope="col">Posts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {topCommunities.map((community, index) => (
                                    <tr key={index}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{community.name.length > 30 ? community.name.substring(0, 30) + "..." : community.name}</td>
                                        <td>{community.type}</td>
                                        <td>{community.member_count}</td>
                                        <td>{community.post_count}</td>
                                    </tr>
                                ))}
                                {topCommunities.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center">No communities available</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                            </div>
                            <div className='table-container'>
                            <h5 className='dashboard-label'>Top 5 Hot Posts</h5>
                            <table className="table dashboard-table">
                                <thead className="thead-dark">
                                    <tr>
                                    <th scope="col">No</th>
                                    <th scope="col" style={{width:"50%"}}>Title</th>
                                    <th scope="col">Likes</th>
                                    <th scope="col">Comments</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {hotPosts.map((post, index) => (
                                    <tr key={index}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{post.title.length > 30 ? post.title.substring(0, 30) + "..." : post.title}</td>
                                        <td>{post.like_count}</td>
                                        <td>{post.comment_count}</td>
                                    </tr>
                                ))}
                                {hotPosts.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center">No hot posts available</td>
                                    </tr>
                                )}
                                    
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </div>
    );
}

export default Dashboard;
