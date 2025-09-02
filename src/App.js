import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import AccreditationRegistryABI from "./AccreditationRegistryABI.json";
import "./App.css";

// --- CONSTANTS ---
const backendURL = "http://localhost:5001";
const CONTRACT_ADDRESS = "0x235c70b08696b89Aac2Dd8e4e4e43003b44Ed7E6";

// --- SVG ICONS ---
const Icons = {
    accreditation: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>,
    issue: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
    verify: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
    user: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
    course: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    rollNo: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" /></svg>,
    info: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>,
    success: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    error: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>,
    pending: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    wallet: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25-2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9v3" /></svg>,
    login: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
    signup: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>,
    metamask: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21.8712 9.63379L21.0746 8.74598L18.2236 5.66064C18.0195 5.43597 17.7119 5.34766 17.4248 5.43597L3.64063 9.63379C3.33301 9.73242 3.12891 10.0293 3.16992 10.3467L4.31445 19.6289C4.3457 19.874 4.5293 20.0781 4.77441 20.1396L11.8301 21.875C11.9189 21.8965 12.0078 21.8965 12.0967 21.875L19.1523 20.1396C19.3975 20.0781 19.5811 19.874 19.6123 19.6289L20.7568 10.3467C20.7979 10.0293 20.5938 9.73242 20.2861 9.63379H21.8712ZM11.4922 2.5752L11.9189 2.84082C12.0967 2.94922 12.3213 2.94922 12.499 2.84082L12.9258 2.5752C13.1553 2.43555 13.4473 2.4873 13.6074 2.69531L14.5117 3.86328C14.6201 4.00879 14.7871 4.09668 14.9697 4.09668H15.4785C15.7441 4.09668 15.9639 4.31641 15.9639 4.58203V5.09082C15.9639 5.27344 16.0518 5.44043 16.1973 5.54883L17.3652 6.45312C17.5732 6.61328 17.625 6.90527 17.4854 7.13477L17.2197 7.56152C17.1113 7.73926 17.1113 7.96387 17.2197 8.1416L17.4854 8.56836C17.625 8.79785 17.5732 9.08984 17.3652 9.25L16.1973 10.1543C16.0518 10.2627 15.9639 10.4297 15.9639 10.6123V11.1211C15.9639 11.3867 15.7441 11.6064 15.4785 11.6064H14.9697C14.7871 11.6064 14.6201 11.6943 14.5117 11.8398L13.6074 13.0078C13.4473 13.2158 13.1553 13.2676 12.9258 13.1279L12.499 12.8623C12.3213 12.7539 12.0967 12.7539 11.9189 12.8623L11.4922 13.1279C11.2627 13.2676 10.9707 13.2158 10.8105 13.0078L9.90625 11.8398C9.79785 11.6943 9.63086 11.6064 9.44824 11.6064H8.93945C8.67383 11.6064 8.4541 11.3867 8.4541 11.1211V10.6123C8.4541 10.4297 8.36621 10.2627 8.2207 10.1543L7.05273 9.25C6.84473 9.08984 6.79297 8.79785 6.93262 8.56836L7.19824 8.1416C7.30664 7.96387 7.30664 7.73926 7.19824 7.56152L6.93262 7.13477C6.79297 6.90527 6.84473 6.61328 7.05273 6.45312L8.2207 5.54883C8.36621 5.44043 8.4541 5.27344 8.4541 5.09082V4.58203C8.4541 4.31641 8.67383 4.09668 8.93945 4.09668H9.44824C9.63086 4.09668 9.79785 4.00879 9.90625 3.86328L10.8105 2.69531C10.9707 2.4873 11.2627 2.43555 11.4922 2.5752Z" fill="#F6851B"/><path d="M11.9639 10.0195C13.0928 10.0195 14.0068 9.10547 14.0068 7.97656C14.0068 6.84766 13.0928 5.93359 11.9639 5.93359C10.835 5.93359 9.9209 6.84766 9.9209 7.97656C9.9209 9.10547 10.835 10.0195 11.9639 10.0195Z" fill="#E2761B"/><path d="M11.9639 9.59961C12.8604 9.59961 13.5869 8.87305 13.5869 7.97656C13.5869 7.08008 12.8604 6.35352 11.9639 6.35352C11.0674 6.35352 10.3408 7.08008 10.3408 7.97656C10.3408 8.87305 11.0674 9.59961 11.9639 9.59961Z" fill="#CC6228"/><path d="M11.9639 8.83984C12.4414 8.83984 12.8271 8.4541 12.8271 7.97656C12.8271 7.49902 12.4414 7.11328 11.9639 7.11328C11.4863 7.11328 11.1006 7.49902 11.1006 7.97656C11.1006 8.4541 11.4863 8.83984 11.9639 8.83984Z" fill="#E2761B"/><path d="M11.9639 8.41992C12.209 8.41992 12.4072 8.22168 12.4072 7.97656C12.4072 7.73145 12.209 7.5332 11.9639 7.5332C11.7188 7.5332 11.5205 7.73145 11.5205 7.97656C11.5205 8.22168 11.7188 8.41992 11.9639 8.41992Z" fill="#CC6228"/><path d="M11.9639 7.59961C12.0771 7.59961 12.1689 7.50781 12.1689 7.39453C12.1689 7.28125 12.0771 7.18945 11.9639 7.18945C11.8506 7.18945 11.7588 7.28125 11.7588 7.39453C11.7588 7.50781 11.8506 7.59961 11.9639 7.59961Z" fill="#E2761B"/><path d="M11.9639 7.17969C12.0166 7.17969 12.0596 7.13672 12.0596 7.08398C12.0596 7.03125 12.0166 6.98828 11.9639 6.98828C11.9111 6.98828 11.8682 7.03125 11.8682 7.08398C11.8682 7.13672 11.9111 7.17969 11.9639 7.17969Z" fill="#CC6228"/></svg>,
};

// --- HELPER UI COMPONENTS ---
const Loader = () => <span className="loader"></span>;
const IconInput = ({ icon, ...props }) => (
    <div className="input-group">
        <input className="form-input" {...props} />
        {icon}
    </div>
);
const StatusDisplay = ({ status }) => {
    if (!status) return null;
    const title = status.type.charAt(0).toUpperCase() + status.type.slice(1);
    const icon = Icons[status.type] || Icons.info;
    return (
        <div className={`status-display ${status.type}`}>
            <div className="status-icon">{icon}</div>
            <div className="status-content">
                <strong>{title}</strong>
                <p>{status.message}</p>
            </div>
        </div>
    );
};

// --- AUTHENTICATION PAGE (Final Alignment Fix) ---
const AuthPage = ({ onLogin, onSignup }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'student',
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            if (isSignUp) {
                await onSignup(formData.username, formData.email, formData.password, formData.role);
            } else {
                await onLogin(formData.username, formData.password);
            }
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'Authentication failed' });
        } finally {
            setLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setIsSignUp(!isSignUp);
        setStatus(null);
        setFormData({ username: '', email: '', password: '', role: 'student' });
    };

    return (
        <div className="auth-container">
            <div className="auth-complex-shapes"><div className="auth-complex-shape"></div><div className="auth-complex-shape"></div><div className="auth-complex-shape"></div><div className="auth-complex-shape"></div><div className="auth-complex-shape"></div></div>
            <div className="auth-wave-overlay"></div>
            <div className="auth-advanced-particles"><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div></div>
            <div className="auth-diagonal-stripes"></div>
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo"><div className="logo-icon">{Icons.accreditation}</div></div>
                    <h1>Certificate Registry</h1>
                    <p>{isSignUp ? 'Create an account to get started' : 'Welcome back! Please sign in'}</p>
                </div>
                <div className="auth-card-content">
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Username</label>
                            <div className="input-wrapper"><div className="input-icon">{Icons.user}</div><input type="text" name="username" placeholder="Enter your username" value={formData.username} onChange={handleInputChange} required /></div>
                        </div>
                        {isSignUp && (<div className="form-group"><label>Email Address</label><div className="input-wrapper"><div className="input-icon">{Icons.user}</div><input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} required /></div></div>)}
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper"><div className="input-icon">{Icons.info}</div><input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleInputChange} required /></div>
                        </div>
                        {isSignUp && (
                            <div className="form-group">
                                <label>I am a:</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
                                    
                                    {/* THE FIX IS HERE: whiteSpace: 'nowrap' prevents the text from wrapping */}
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                        <input type="radio" name="role" value="student" checked={formData.role === 'student'} onChange={handleInputChange} />
                                        Student
                                    </label>
                                    
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                        <input type="radio" name="role" value="college" checked={formData.role === 'college'} onChange={handleInputChange} />
                                        College Authority
                                    </label>

                                </div>
                            </div>
                        )}
                        <button type="submit" className="auth-button" disabled={loading}>{loading ? <Loader /> : (isSignUp ? 'Create Account' : 'Sign In')}</button>
                        <StatusDisplay status={status} />
                    </form>
                    <div className="auth-footer">
                        <p>{isSignUp ? "Already have an account?" : "Don't have an account?"}<button type="button" className="auth-link" onClick={toggleAuthMode}>{isSignUp ? 'Sign In' : 'Sign Up'}</button></p>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- WALLET LINK PAGE ---
const WalletLinkPage = ({ onLinkWallet }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const handleConnectWallet = async () => {
        setLoading(true);
        setStatus(null);
        try {
            if (!window.ethereum) throw new Error("MetaMask is not installed.");
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length === 0) throw new Error("No accounts found. Please connect to MetaMask.");
            await onLinkWallet(accounts[0]);
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'Failed to connect wallet' });
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="auth-container">
            <div className="auth-complex-shapes"><div className="auth-complex-shape"></div><div className="auth-complex-shape"></div><div className="auth-complex-shape"></div><div className="auth-complex-shape"></div><div className="auth-complex-shape"></div></div>
            <div className="auth-wave-overlay"></div>
            <div className="auth-advanced-particles"><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div><div className="auth-advanced-particle"></div></div>
            <div className="auth-diagonal-stripes"></div>
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo"><div className="logo-icon">{Icons.wallet}</div></div>
                    <h1>Link Your Wallet</h1><p>Connect your wallet to complete your account setup</p>
                </div>
                <div className="auth-card-content">
                    <div className="wallet-content">
                        <div className="wallet-info"><div className="wallet-icon">{Icons.metamask}</div><h3>MetaMask</h3><p>Connect using your MetaMask wallet to securely link it to your account</p></div>
                        <button onClick={handleConnectWallet} className="wallet-button" disabled={loading}>{loading ? <Loader /> : (<><span className="wallet-button-icon">{Icons.metamask}</span>Connect MetaMask Wallet</>)}</button>
                        <StatusDisplay status={status} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- STUDENT DASHBOARD ---
const StudentDashboard = ({ username, onLogout }) => {
    const [verifyId, setVerifyId] = useState("");
    const [verifyResult, setVerifyResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!verifyId) {
            setVerifyResult({ success: false, message: "Please enter a Certificate ID." });
            return;
        }
        setLoading(true);
        setVerifyResult({ message: "Verifying certificate..." });

        try {
            const res = await fetch(`${backendURL}/api/verify/${verifyId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || `Server responded with status: ${res.status}`);

            setVerifyResult({ success: true, message: `✅ Verified! (Source: ${data.source})`, certificate: data.certificate });
        } catch (err) {
            setVerifyResult({ success: false, message: `❌ Error: ${err.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-pattern"></div>
                <div className="sidebar-header"><div className="sidebar-logo"></div><h2>Certificate Registry</h2></div>
                <div className="wallet-connected"><span>Welcome, {username}!</span></div>
                <button onClick={onLogout} className="btn btn-secondary logout-button">Logout</button>
                <div className="sidebar-advanced-pattern"></div>
            </aside>
            <main className="main-content">
                <div className="page-header">
                    <h1>Student Dashboard</h1>
                    <p>Verify the authenticity of your academic certificates.</p>
                </div>
                <div className="card-grid">
                    <section className="card full-width">
                        <div className="card-header"><div className="card-icon">{Icons.verify}</div><h3 className="card-title">Verify a Certificate</h3></div>
                        <div className="card-content">
                            <div className="verify-group">
                                <IconInput icon={Icons.verify} placeholder="Enter Certificate ID to verify" value={verifyId} onChange={e => setVerifyId(e.target.value)} />
                                <button onClick={handleVerify} className="btn btn-primary" disabled={loading}>{loading ? <Loader /> : 'Verify'}</button>
                            </div>
                            {verifyResult && (
                                <div className="verify-result">
                                    <p>{verifyResult.message}</p>
                                    {verifyResult.certificate && (<pre>{JSON.stringify(verifyResult.certificate, null, 2)}</pre>)}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

// --- COLLEGE DASHBOARD ---
const CollegeDashboard = ({ onLogout }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [status, setStatus] = useState({ type: 'info', message: 'Connect wallet to begin.' });
    const [loadingStates, setLoadingStates] = useState({ 
        connect: false, request: false, checkStatus: false, 
        checkDuplicate: false, issue: false, verify: false 
    });
    const [collegeName, setCollegeName] = useState("");
    const [requestStatus, setRequestStatus] = useState('idle');
    const [accreditationProof, setAccreditationProof] = useState(null);
    const [accreditationSignature, setAccreditationSignature] = useState(null);
    const [studentName, setStudentName] = useState("");
    const [course, setCourse] = useState("");
    const [rollNo, setRollNo] = useState("");
    const [dateOfIssuing, setDateOfIssuing] = useState(new Date().toISOString().slice(0, 10));
    const [canIssue, setCanIssue] = useState(false);
    const [issuedCertificateId, setIssuedCertificateId] = useState(null);
    const [verifyId, setVerifyId] = useState("");
    const [verifyResult, setVerifyResult] = useState(null);
    const [walletMismatch, setWalletMismatch] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const jwtToken = localStorage.getItem('jwtToken');

    useEffect(() => {
        const savedState = localStorage.getItem('collegeDashboardState');
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                setAccount(parsedState.account);
                setCollegeName(parsedState.collegeName || "");
                setRequestStatus(parsedState.requestStatus || 'idle');
                setAccreditationProof(parsedState.accreditationProof);
                setAccreditationSignature(parsedState.accreditationSignature);
                setStudentName(parsedState.studentName || "");
                setCourse(parsedState.course || "");
                setRollNo(parsedState.rollNo || "");
                setDateOfIssuing(parsedState.dateOfIssuing || new Date().toISOString().slice(0, 10));
                setCanIssue(parsedState.canIssue || false);
                setVerifyId(parsedState.verifyId || "");
                setIssuedCertificateId(parsedState.issuedCertificateId);
                
                if (parsedState.account) reconnectWallet(parsedState.account);
            } catch (error) { console.error('Error loading saved state:', error); }
        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            const stateToSave = {
                account, collegeName, requestStatus, accreditationProof, accreditationSignature,
                studentName, course, rollNo, dateOfIssuing, canIssue, verifyId, issuedCertificateId
            };
            localStorage.setItem('collegeDashboardState', JSON.stringify(stateToSave));
        }
    }, [
        account, collegeName, requestStatus, accreditationProof, accreditationSignature,
        studentName, course, rollNo, dateOfIssuing, canIssue, verifyId, issuedCertificateId, isInitialized
    ]);
    
    useEffect(() => {
        if (jwtToken && account) verifyWalletConnection();
    }, [jwtToken, account]);

    const setLoading = (key, value) => setLoadingStates(prev => ({ ...prev, [key]: value }));
    const generateContentHash = (collegeAddress, rollNo) => ethers.solidityPackedKeccak256(["address", "string"], [collegeAddress, rollNo.toLowerCase()]);

    const verifyWalletConnection = () => {
        if (!account || !jwtToken) return;
        try {
            const payload = JSON.parse(atob(jwtToken.split('.')[1]));
            const storedWallet = payload.collegeAddress;
            if (account.toLowerCase() !== storedWallet.toLowerCase()) {
                setWalletMismatch(true);
                setStatus({ type: 'error', message: `Wallet Mismatch! Please connect account ${storedWallet.slice(0, 6)}...` });
            } else {
                setWalletMismatch(false);
            }
        } catch (error) { console.error('Error verifying wallet:', error); }
    };

    const reconnectWallet = async (savedAccount) => {
        if (!window.ethereum) return;
        setLoading('connect', true);
        try {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await web3Provider.send("eth_accounts", []);
            if (accounts.includes(savedAccount)) {
                setProvider(web3Provider);
                setAccount(savedAccount);
                await handleCheckStatus(savedAccount);
                setStatus({ type: 'success', message: 'Wallet reconnected!' });
            }
        } catch (err) {
            console.error('Error reconnecting wallet:', err);
        } finally {
            setLoading('connect', false);
        }
    };

    async function connectWallet() {
        if (!window.ethereum) return setStatus({ type: 'error', message: "MetaMask is not installed." });
        setLoading('connect', true);
        setStatus({ type: 'info', message: "Connecting..." });
        try {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(web3Provider);
            const accounts = await web3Provider.send("eth_requestAccounts", []);
            setAccount(accounts[0]);
            await handleCheckStatus(accounts[0]);
        } catch (err) {
            setStatus({ type: 'error', message: "Failed to connect wallet." });
            console.error(err);
        } finally {
            setLoading('connect', false);
        }
    }

    function disconnectWallet() {
        setAccount(null);
        setProvider(null);
        setStatus({ type: 'info', message: 'Wallet disconnected.' });
        setRequestStatus('idle');
        localStorage.removeItem('collegeDashboardState');
    }

    async function handleRequestAccreditation() {
        setLoading('request', true);
        setStatus({ type: 'pending', message: "Submitting request..." });
        try {
            const res = await fetch(`${backendURL}/api/request-accreditation`, { 
                method: "POST", 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwtToken}` }, 
                body: JSON.stringify({ collegeAddress: account, collegeName }) 
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStatus({ type: 'success', message: data.message });
            setRequestStatus('pending');
        } catch (err) {
            setStatus({ type: 'error', message: `Error: ${err.message}` });
        } finally {
            setLoading('request', false);
        }
    }

    async function handleCheckStatus(address) {
        const checkAddress = address || account;
        if (!checkAddress) return;
        setLoading('checkStatus', true);
        try {
            const res = await fetch(`${backendURL}/api/check-status/${checkAddress}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            if (res.status === 404) {
                setRequestStatus('idle');
                setStatus({ type: 'info', message: "No request submitted yet." });
                return;
            }
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setRequestStatus(data.status);
            if (data.status === 'approved') {
                setAccreditationProof(data.proof);
                setAccreditationSignature(data.signature);
                setStatus({ type: 'success', message: "Accreditation approved!" });
            } else {
                setStatus({ type: 'info', message: `Request is ${data.status}.` });
            }
        } catch (err) {
            setStatus({ type: 'error', message: `Error checking status: ${err.message}` });
        } finally {
            setLoading('checkStatus', false);
        }
    }

    async function handleCheckDuplicate() {
        setLoading('checkDuplicate', true);
        setStatus({ type: 'info', message: "Checking for duplicates..." });
        try {
            const res = await fetch(`${backendURL}/api/check-duplicate`, { 
                method: "POST", 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwtToken}` }, 
                body: JSON.stringify({ collegeAddress: account, rollNo }) 
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (data.isDuplicate) {
                setCanIssue(false);
                setStatus({ type: 'error', message: data.message });
            } else {
                setCanIssue(true);
                setStatus({ type: 'success', message: "This roll number is unique." });
            }
        } catch (err) {
            setStatus({ type: 'error', message: `Error: ${err.message}` });
        } finally {
            setLoading('checkDuplicate', false);
        }
    }

    async function handleIssueCertificate() {
        setLoading('issue', true);
        setStatus({ type: 'info', message: "Preparing transaction..." });
        try {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccreditationRegistryABI.abi, signer);
            const certificateId = 'cert-' + Math.random().toString(36).substring(2, 15);
            const contentHash = generateContentHash(account, rollNo);
            
            setStatus({ type: 'info', message: "Waiting for MetaMask confirmation..." });
            const tx = await contract.createCertificateWithProof(
                certificateId, studentName, course, rollNo, dateOfIssuing, contentHash, 
                accreditationProof.collegeName, accreditationProof.validUntil, accreditationSignature
            );
            
            setStatus({ type: 'pending', message: `Transaction sent. Waiting for confirmation...` });
            const receipt = await tx.wait();
            
            await fetch(`${backendURL}/api/sync`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwtToken}` }, 
                body: JSON.stringify({ certificateId, txHash: receipt.hash }) 
            });
            setStatus({ type: 'success', message: "Certificate created successfully!" });
            setIssuedCertificateId(certificateId);
            setCanIssue(false);
        } catch (err) {
            const reason = err.reason || err.message;
            if (reason && (reason.includes("user rejected transaction") || err.code === 4001)) {
                setStatus({ type: 'error', message: "Transaction rejected in MetaMask." });
            } else {
                setStatus({ type: 'error', message: `Error: ${reason}` });
            }
        } finally {
            setLoading('issue', false);
        }
    }

    async function handleVerify() {
        if (!verifyId) return setVerifyResult({ message: "Please enter a Certificate ID." });
        setLoading('verify', true);
        setVerifyResult({ message: "Verifying..." });
        try {
            const res = await fetch(`${backendURL}/api/verify/${verifyId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || `Server responded with status: ${res.status}`);
            setVerifyResult({ success: true, message: `✅ Verified! (Source: ${data.source})`, certificate: data.certificate });
        } catch (err) {
            setVerifyResult({ success: false, message: `❌ Error: ${err.message}` });
        } finally {
            setLoading('verify', false);
        }
    }
    
    const renderAccreditationContent = () => {
        switch (requestStatus) {
            case 'pending': return <div><p>Your request is pending review.</p><button onClick={() => handleCheckStatus()} className="btn btn-secondary" disabled={loadingStates.checkStatus}>{loadingStates.checkStatus ? <Loader /> : 'Check Status'}</button></div>;
            case 'approved': return <div><p>Accreditation approved! You can now issue certificates.</p></div>;
            case 'rejected': return <div><p>Your request was rejected.</p></div>;
            default: return (<div className="card-content"><p>Enter your college name to request accreditation.</p><IconInput icon={Icons.accreditation} placeholder="Your College Name" value={collegeName} onChange={e => setCollegeName(e.target.value)} /><button onClick={handleRequestAccreditation} className="btn btn-primary" disabled={!account || !collegeName || loadingStates.request}>{loadingStates.request ? <Loader /> : 'Request Accreditation'}</button></div>);
        }
    };
    
    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-pattern"></div>
                <div className="sidebar-header"><div className="sidebar-logo"></div><h2>Certificate Registry</h2></div>
                {walletMismatch ? (<div className="wallet-mismatch">{Icons.error}<span>Wallet Mismatch</span></div>) : null}
                {account ? (<div className="wallet-connected"><span>{account.slice(0, 6)}...{account.slice(-4)}</span><button onClick={disconnectWallet} className="btn btn-danger">Disconnect</button></div>) : (<button onClick={connectWallet} className="btn btn-primary" disabled={loadingStates.connect}>{loadingStates.connect ? <Loader /> : "Connect Wallet"}</button>)}
                <button onClick={onLogout} className="btn btn-secondary logout-button">Logout</button>
                <StatusDisplay status={status} />
                <div className="sidebar-advanced-pattern"></div>
            </aside>
            <main className="main-content">
                <div className="page-header">
                    <h1>College Dashboard</h1>
                    <p>Manage accreditation and issue decentralized certificates.</p>
                </div>
                {walletMismatch && (<div className="wallet-mismatch-warning">{Icons.error}<div><strong>Wallet Mismatch!</strong><p>Please switch to your linked account in MetaMask.</p></div></div>)}
                <div className="card-grid">
                    <section className="card">
                        <div className="card-header"><div className="card-icon">{Icons.accreditation}</div><h3 className="card-title">Step 1: Get Accredited</h3></div>
                        {renderAccreditationContent()}
                    </section>
                    <section className={`card ${requestStatus !== 'approved' ? 'disabled' : ''}`}>
                        <div className="card-header"><div className="card-icon">{Icons.issue}</div><h3 className="card-title">Step 2: Issue Certificate</h3></div>
                        <div className="card-content">
                            <IconInput icon={Icons.user} placeholder="Student Name" value={studentName} onChange={e => setStudentName(e.target.value)} />
                            <IconInput icon={Icons.course} placeholder="Course Name" value={course} onChange={e => setCourse(e.target.value)} />
                            <IconInput icon={Icons.rollNo} placeholder="Roll Number" value={rollNo} onChange={e => setRollNo(e.target.value)} />
                            <IconInput icon={<></>} type="date" value={dateOfIssuing} onChange={e => setDateOfIssuing(e.target.value)} />
                            <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                                <button onClick={handleCheckDuplicate} className="btn btn-secondary" disabled={!rollNo || loadingStates.checkDuplicate || walletMismatch}>{loadingStates.checkDuplicate && <Loader/>}Check Duplicate</button>
                                <button onClick={handleIssueCertificate} className="btn btn-primary" disabled={!canIssue || loadingStates.issue || walletMismatch}>{loadingStates.issue && <Loader/>}Issue On-Chain</button>
                            </div>
                            {issuedCertificateId && (<div className="certificate-id-display"><div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>{Icons.success}<strong style={{ marginLeft: '0.5rem' }}>Certificate Created!</strong></div><div><strong>ID:</strong> {issuedCertificateId}</div></div>)}
                        </div>
                    </section>
                    <section className="card full-width">
                        <div className="card-header">
                            <div className="card-icon">{Icons.verify}</div>
                            <h3 className="card-title">Step 3: Verify Certificate</h3>
                        </div>
                        <div className="card-content">
                            <div className="verify-group">
                                <IconInput icon={Icons.verify} placeholder="Enter Certificate ID to verify its authenticity" value={verifyId} onChange={e => setVerifyId(e.target.value)} />
                                <button onClick={handleVerify} className="btn btn-primary" disabled={loadingStates.verify}>{loadingStates.verify ? <Loader /> : 'Verify Certificate'}</button>
                            </div>
                            {verifyResult && (
                                <div className="verify-result">
                                    <p>{verifyResult.message}</p>
                                    {verifyResult.certificate && (<pre>{JSON.stringify(verifyResult.certificate, null, 2)}</pre>)}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [username, setUsername] = useState('');
    const [showWalletLink, setShowWalletLink] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);
    
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsAuthenticated(true);
                setUserRole(payload.role);
                setUsername(payload.username);
            } catch (e) {
                localStorage.removeItem('jwtToken');
            }
        }
        setIsInitialized(true);
    }, []);

    const handleLogin = async (username, password) => {
        const response = await fetch(`${backendURL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        localStorage.setItem('jwtToken', data.token);
        setIsAuthenticated(true);
        setUserRole(data.role);
        setUsername(username);
    };

    const handleSignup = async (username, email, password, role) => {
        const response = await fetch(`${backendURL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        if (role === 'student') {
            localStorage.setItem('jwtToken', data.token);
            setIsAuthenticated(true);
            setUserRole(data.role);
            setUsername(username);
        } else {
            setUserEmail(email);
            setShowWalletLink(true);
        }
    };

    const handleLinkWallet = async (walletAddress) => {
        const response = await fetch(`${backendURL}/api/link-wallet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, walletAddress })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        localStorage.setItem('jwtToken', data.token);
        setIsAuthenticated(true);
        setUserRole(data.role);
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        setUsername(payload.username);
        setShowWalletLink(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('collegeDashboardState');
        setIsAuthenticated(false);
        setUserRole(null);
        setUsername('');
    };

    if (!isInitialized) {
        return <div className="loading-container"><Loader /></div>;
    }

    if (!isAuthenticated) {
        if (showWalletLink) {
            return <WalletLinkPage onLinkWallet={handleLinkWallet} />;
        }
        return <AuthPage onLogin={handleLogin} onSignup={handleSignup} />;
    }

    if (userRole === 'student') {
        return <StudentDashboard username={username} onLogout={handleLogout} />;
    }

    if (userRole === 'college') {
        return <CollegeDashboard onLogout={handleLogout} />;
    }

    return <div className="loading-container"><Loader /></div>;
}