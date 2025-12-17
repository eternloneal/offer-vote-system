// ============================
// Firebase配置
// ============================
// 注意：这里需要替换成你自己的Firebase配置！

const firebaseConfig = {
  apiKey: "AIzaSyAUa6YlMs6SddJqtPP6LAY9ADA_G62JBW4",
  authDomain: "offer-vote.firebaseapp.com",
  projectId: "offer-vote",
  storageBucket: "offer-vote.firebasestorage.app",
  messagingSenderId: "1078005821558",
  appId: "1:1078005821558:web:cd7829fc74ce0bf6912f57",
  measurementId: "G-NV7G3MYZSC"
};



// ============================
// 初始化
// ============================

// 初始化Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 投票数据状态
let votesData = {
    offerA: 0,
    offerB: 0,
    offerC: 0
};

// 用户投票状态
let userVoted = localStorage.getItem('userVoted') || false;
let chart = null;

// ============================
// 页面加载时初始化
// ============================
document.addEventListener('DOMContentLoaded', function() {
    // 初始化雷达图
    initRadarChart();
    
    // 监听实时数据
    listenToVotes();
    
    // 显示用户投票状态
    if (userVoted) {
        highlightSelectedCard(userVoted);
        showMessage('您已投票给 <strong>' + getOfferName(userVoted) + '</strong>', 'info');
    }
});

// ============================
// 初始化雷达图
// ============================
function initRadarChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    chart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['工作强度', '薪资待遇', '发展前景', '稳定性'],
            datasets: [
                {
                    label: 'Offer A',
                    data: [8, 9, 7, 6],
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#FF6B6B',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Offer B',
                    data: [6, 7, 9, 8],
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#4ECDC4',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Offer C',
                    data: [5, 8, 6, 9],
                    borderColor: '#FFD166',
                    backgroundColor: 'rgba(255, 209, 102, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#FFD166',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            size: 14,
                            family: "'Segoe UI', 'Microsoft YaHei', sans-serif"
                        },
                        color: '#555'
                    },
                    ticks: {
                        backdropColor: 'transparent',
                        font: {
                            size: 11
                        },
                        stepSize: 2
                    },
                    suggestedMin: 0,
                    suggestedMax: 10
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 14,
                            family: "'Segoe UI', 'Microsoft YaHei', sans-serif"
                        },
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            }
        }
    });
}

// ============================
// 监听实时投票数据
// ============================
function listenToVotes() {
    database.ref('votes').on('value', (snapshot) => {
        if (snapshot.exists()) {
            votesData = snapshot.val();
            updateVoteDisplay();
            updateChartColors();
            updatePercentages();
        } else {
            // 如果没有数据，初始化数据库
            initializeDatabase();
        }
    });
}

// ============================
// 初始化数据库（第一次运行时）
// ============================
function initializeDatabase() {
    database.ref('votes').set({
        offerA: 0,
        offerB: 0,
        offerC: 0
    });
}

// ============================
// 更新投票显示
// ============================
function updateVoteDisplay() {
    // 更新票数显示
    document.getElementById('votesA').textContent = votesData.offerA + '票';
    document.getElementById('votesB').textContent = votesData.offerB + '票';
    document.getElementById('votesC').textContent = votesData.offerC + '票';
    
    // 计算总票数
    const totalVotes = votesData.offerA + votesData.offerB + votesData.offerC;
    document.getElementById('totalVotes').textContent = totalVotes;
    
    // 更新选中状态
    updateCardSelection();
}

// ============================
// 更新卡片选中状态
// ============================
function updateCardSelection() {
    // 移除所有选中状态
    document.getElementById('cardA').classList.remove('selected');
    document.getElementById('cardB').classList.remove('selected');
    document.getElementById('cardC').classList.remove('selected');
    
    // 如果用户已投票，高亮对应卡片
    if (userVoted) {
        document.getElementById('card' + userVoted.replace('offer', '')).classList.add('selected');
    }
}

// ============================
// 更新图表颜色（根据票数调整透明度）
// ============================
function updateChartColors() {
    const totalVotes = votesData.offerA + votesData.offerB + votesData.offerC;
    
    if (totalVotes > 0 && chart) {
        // 计算每个offer的投票比例
        const ratioA = votesData.offerA / totalVotes;
        const ratioB = votesData.offerB / totalVotes;
        const ratioC = votesData.offerC / totalVotes;
        
        // 根据票数调整透明度（票数越多，颜色越深）
        chart.data.datasets[0].backgroundColor = `rgba(255, 107, 107, ${0.1 + ratioA * 0.4})`;
        chart.data.datasets[1].backgroundColor = `rgba(78, 205, 196, ${0.1 + ratioB * 0.4})`;
        chart.data.datasets[2].backgroundColor = `rgba(255, 209, 102, ${0.1 + ratioC * 0.4})`;
        
        chart.update();
    }
}

// ============================
// 更新百分比显示
// ============================
function updatePercentages() {
    const totalVotes = votesData.offerA + votesData.offerB + votesData.offerC;
    
    if (totalVotes > 0) {
        document.getElementById('offerAPercent').textContent = Math.round((votesData.offerA / totalVotes) * 100) + '%';
        document.getElementById('offerBPercent').textContent = Math.round((votesData.offerB / totalVotes) * 100) + '%';
        document.getElementById('offerCPercent').textContent = Math.round((votesData.offerC / totalVotes) * 100) + '%';
    } else {
        document.getElementById('offerAPercent').textContent = '0%';
        document.getElementById('offerBPercent').textContent = '0%';
        document.getElementById('offerCPercent').textContent = '0%';
    }
}

// ============================
// 投票函数
// ============================
function vote(offer) {
    // 检查是否已投票
    if (userVoted) {
        showMessage('您已经投过票了！', 'warning');
        return;
    }
    
    // 生成用户ID（基于IP和浏览器信息）
    const userId = generateUserId();
    const userRef = database.ref('users/' + userId);
    
    // 检查用户是否已投票
    userRef.once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            // 记录用户投票
            userRef.set({
                votedFor: offer,
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            }).then(() => {
                // 更新票数
                const voteRef = database.ref('votes/' + offer);
                return voteRef.transaction((currentValue) => {
                    return (currentValue || 0) + 1;
                });
            }).then(() => {
                // 更新本地状态
                userVoted = offer;
                localStorage.setItem('userVoted', offer);
                
                // 高亮选中的卡片
                highlightSelectedCard(offer);
                
                // 显示成功消息
                const offerName = getOfferName(offer);
                showMessage('投票成功！您选择了：' + offerName, 'success');
                
                // 添加脉冲动画
                const card = document.getElementById('card' + offer.replace('offer', ''));
                card.classList.add('pulse');
                setTimeout(() => card.classList.remove('pulse'), 1500);
                
            }).catch((error) => {
                console.error('投票失败:', error);
                showMessage('投票失败，请重试', 'error');
            });
        } else {
            // 用户已投票
            userVoted = snapshot.val().votedFor;
            localStorage.setItem('userVoted', userVoted);
            highlightSelectedCard(userVoted);
            showMessage('您已经投过票了！', 'warning');
        }
    }).catch((error) => {
        console.error('检查用户状态失败:', error);
        showMessage('网络错误，请重试', 'error');
    });
}

// ============================
// 高亮选中的卡片
// ============================
function highlightSelectedCard(offer) {
    // 移除所有选中状态
    document.getElementById('cardA').classList.remove('selected');
    document.getElementById('cardB').classList.remove('selected');
    document.getElementById('cardC').classList.remove('selected');
    
    // 添加选中状态
    const cardId = 'card' + offer.replace('offer', '');
    document.getElementById(cardId).classList.add('selected');
}

// ============================
// 显示消息
// ============================
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    const messageText = document.getElementById('messageText');
    
    messageText.innerHTML = text;
    
    // 设置消息类型样式
    messageDiv.className = 'user-message show';
    if (type === 'success') {
        messageDiv.style.background = '#d4edda';
        messageDiv.style.borderLeftColor = '#28a745';
        messageDiv.style.color = '#155724';
    } else if (type === 'warning') {
        messageDiv.style.background = '#fff3cd';
        messageDiv.style.borderLeftColor = '#ffc107';
        messageDiv.style.color = '#856404';
    } else if (type === 'error') {
        messageDiv.style.background = '#f8d7da';
        messageDiv.style.borderLeftColor = '#dc3545';
        messageDiv.style.color = '#721c24';
    } else {
        messageDiv.style.background = '#d1ecf1';
        messageDiv.style.borderLeftColor = '#17a2b8';
        messageDiv.style.color = '#0c5460';
    }
    
    // 5秒后自动隐藏
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}

// ============================
// 生成用户ID
// ============================
function generateUserId() {
    // 使用IP地址（简化版）和浏览器信息生成唯一ID
    const randomStr = Math.random().toString(36).substr(2, 9);
    const timeStr = Date.now().toString(36);
    return 'user_' + randomStr + '_' + timeStr;
}

// ============================
// 获取Offer名称
// ============================
function getOfferName(offer) {
    const names = {
        'offerA': 'Offer A（大厂技术岗）',
        'offerB': 'Offer B（外企管理岗）',
        'offerC': 'Offer C（国企稳定岗）'
    };
    return names[offer] || offer;
}