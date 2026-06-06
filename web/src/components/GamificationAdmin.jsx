import React, { useState, useEffect } from 'react';
import { getGamificationStats, getGamificationLeaderboard, configureGamificationMultiplier } from '../api/adminApi';
import { Coins, Trophy, Settings, TrendingUp, Award } from 'lucide-react';

const MitanCoin = () => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #B45309, #D97706)',
    fontSize: '12px',
    marginRight: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  }}>🌾</span>
);

const GamificationAdmin = () => {
  const [stats, setStats] = useState({
    total_circulating: 0,
    total_awarded: 0,
    total_redeemed: 0
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [multipliers, setMultipliers] = useState({
    high_grade: 5,
    medium_grade: 3,
    low_grade: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsData = await getGamificationStats();
      setStats(statsData);
      
      const leaderboardData = await getGamificationLeaderboard();
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Failed to fetch gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMultiplierChange = (e) => {
    setMultipliers({
      ...multipliers,
      [e.target.name]: Number(e.target.value)
    });
  };

  const saveMultipliers = async () => {
    try {
      await configureGamificationMultiplier(multipliers);
      alert("Multipliers saved successfully!");
    } catch (error) {
      console.error("Failed to save multipliers:", error);
      alert("Error saving multipliers");
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-50 text-yellow-800 border-yellow-400'; // Gold
      case 2: return 'bg-gray-50 text-gray-800 border-gray-400'; // Silver
      case 3: return 'bg-orange-50 text-orange-800 border-orange-400'; // Bronze
      default: return 'bg-white text-gray-600 border-transparent';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Award className="w-5 h-5 text-yellow-500" />;
      case 2: return <Award className="w-5 h-5 text-gray-500" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-green-600">Loading gamification data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg">
          <Trophy className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gamification & Rewards</h2>
          <p className="text-gray-500 text-sm">Manage Mitan-Mudra, leaderboard, and reward mechanics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Mitan-Mudra in Circulation</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2 flex items-center"><MitanCoin/> {stats.total_circulating.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Coins className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Mitan-Mudra Awarded</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2 flex items-center"><MitanCoin/> {stats.total_awarded.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Mitan-Mudra Redeemed</p>
              <h3 className="text-3xl font-bold text-purple-600 mt-2 flex items-center"><MitanCoin/> {stats.total_redeemed.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Coins className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" /> Top Citizens Leaderboard
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="px-6 py-3 font-medium">Rank</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">House ID</th>
                  <th className="px-6 py-3 font-medium text-right">Current Balance</th>
                  <th className="px-6 py-3 font-medium text-right">Total Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {leaderboard.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No leaderboard data available</td></tr>
                ) : (
                  leaderboard.map((citizen) => (
                    <tr key={citizen.rank} className={`hover:bg-gray-50 transition-colors border-l-4 ${getRankStyle(citizen.rank)}`}>
                      <td className="px-6 py-4 font-medium flex items-center">
                        {getRankIcon(citizen.rank)}
                        <span className={citizen.rank <= 3 ? "ml-2" : "ml-7"}>#{citizen.rank}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{citizen.name}</td>
                      <td className="px-6 py-4 text-gray-500">{citizen.house_id}</td>
                      <td className="px-6 py-4 text-right font-medium text-blue-600"><span className="flex items-center justify-end"><MitanCoin/> {citizen.balance.toLocaleString()}</span></td>
                      <td className="px-6 py-4 text-right font-medium text-green-600"><span className="flex items-center justify-end"><MitanCoin/> {citizen.total_earned.toLocaleString()}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-500" /> Point Configurator
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">High Grade Multiplier</label>
              <div className="relative">
                <input 
                  type="number" 
                  name="high_grade"
                  value={multipliers.high_grade}
                  onChange={handleMultiplierChange}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">x</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Mitan-Mudra per kg for High quality plastic.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medium Grade Multiplier</label>
              <div className="relative">
                <input 
                  type="number" 
                  name="medium_grade"
                  value={multipliers.medium_grade}
                  onChange={handleMultiplierChange}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">x</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Low Grade Multiplier</label>
              <div className="relative">
                <input 
                  type="number" 
                  name="low_grade"
                  value={multipliers.low_grade}
                  onChange={handleMultiplierChange}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">x</span>
                </div>
              </div>
            </div>

            <button 
              onClick={saveMultipliers}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationAdmin;
