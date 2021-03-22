import React, { useEffect, useState } from 'react';
import { Bar } from '@reactchartjs/react-chart.js';
import { useLoading, Bars } from '@agney/react-loading';
import { toast } from 'react-toastify';

import './App.css';
import api from './services';

const options = {
    scales: {
        yAxes: [
            {
                ticks: {
                    beginAtZero: true,
                    callback: (value) => {
                        return new Intl.NumberFormat('pt-BR', 
                            { maximumSignificantDigits: 3 }).format(value);
                    }
                }
            }
        ]
    },
    tooltips: {
        callbacks: {
            label: function(tooltipItem, chart){
                const datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                return `${datasetLabel}: ${new Intl.NumberFormat('pt-BR', 
                    { maximumSignificantDigits: 3 }).format(tooltipItem.yLabel)}`;
            }
        }
    },
    legend: {
        display: false
    }
}

function App() {
    const [rankedNames, setRankedNames] = useState(null);
    const [searchName, setSearchName] = useState('');

    useEffect(() => {
        async function fetchData() {
            api.get('/ranking').then(res => {
                if (res.status !== 200) {
                    return;
                }
        
                let names = res.data[0].res;
        
                setRankedNames({
                    labels: names.map((name) => {
                        return name.nome[0].toUpperCase() + name.nome.substring(1).toLowerCase();
                    }),
                    datasets: [
                        {
                            label: 'Quantidade de pessoas',
                            data: names.map((name) => {
                                return name.frequencia;
                            }),
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }
                    ]
                });
            });
        }

        fetchData();
    }, []);

    async function findName() {
        setRankedNames(null);

        console.log(searchName);
    
        api.get(`/${searchName.toLowerCase()}`).then(res => {
            if (res.status !== 200 || res.data.length === 0 || res.data[0].res.length === 0) {
                api.get('/ranking').then(res => {
                    if (res.status !== 200) {
                        return;
                    }
            
                    let names = res.data[0].res;
            
                    setRankedNames({
                        labels: names.map((name) => {
                            return name.nome[0].toUpperCase() + name.nome.substring(1).toLowerCase();
                        }),
                        datasets: [
                            {
                                label: 'Quantidade de pessoas',
                                data: names.map((name) => {
                                    return name.frequencia;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1
                            }
                        ]
                    });
                });

                toast.error('😢 Não há registros com esse nome', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });

                return;
            }
    
            let names = res.data[0].res;

            setRankedNames({
                labels: names.map((name) => {
                    return name.periodo;
                }),
                datasets: [
                    {
                        label: 'Quantidade de pessoas',
                        data: names.map((name) => {
                            return name.frequencia;
                        }),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }
                ]
            });
        });
    }

    const { containerProps, indicatorEl } = useLoading({
        loading: true,
        indicator: <Bars width="20" />
    });

    return (
        <div className="app">
            <header className="header">
                <h3>
                    IBGE - Situação dos nomes no Brasil 
                </h3>
            </header>
            <div className="body" { ...containerProps }>
                <div className="ranking">
                    { rankedNames === null && 
                        indicatorEl
                    }
                    { rankedNames !== null &&
                        <Bar data={ rankedNames } options={ options } />
                    }
                </div>
                <div className="searchName">
                    <span className="icon">
                        <i className="fa fa-search"></i>
                    </span>
                    <input value={searchName} 
                        className="search" 
                        type="search" 
                        placeholder="Procure por algum nome" 
                        onChange={ e => setSearchName(e.target.value) }
                        onKeyPress={ e => {                    
                            if (e.key === "Enter" && searchName !== '') {
                                findName();
                            }
                    }} />
                </div>
            </div>
        </div>
    );
}

export default App;
