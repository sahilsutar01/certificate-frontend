import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import AccreditationRegistryABI from "./AccreditationRegistryABI.json";
import "./App.css";
// --- CONSTANTS ---
const backendURL = "http://localhost:5001";
const CONTRACT_ADDRESS = "0x235c70b08696b89Aac2Dd8e4e4e43003b44Ed7E6";
// --- SVG ICONS ---
// A collection of SVG icons for a cleaner main component
const Icons = {
    accreditation: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>,
    issue: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
    verify: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
    user: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
    course: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    rollNo: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" /></svg>,
    info: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    success: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    error: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>,
    pending: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
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
// --- MAIN APP COMPONENT ---
export default function App() {
    // ALL STATE AND LOGIC IS IDENTICAL TO THE ORIGINAL CODE
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [status, setStatus] = useState({ type: 'info', message: 'Connect wallet to begin.' });
    const [loadingStates, setLoadingStates] = useState({ connect: false, request: false, checkStatus: false, checkDuplicate: false, issue: false, verify: false });
    const [collegeName, setCollegeName] = useState("");
    const [requestStatus, setRequestStatus] = useState('idle');
    const [accreditationProof, setAccreditationProof] = useState(null);
    const [accreditationSignature, setAccreditationSignature] = useState(null);
    const [studentName, setStudentName] = useState("");
    const [course, setCourse] = useState("");
    const [rollNo, setRollNo] = useState("");
    const [dateOfIssuing, setDateOfIssuing] = useState(new Date().toISOString().slice(0, 10));
    const [canIssue, setCanIssue] = useState(false);
    const [verifyId, setVerifyId] = useState("");
    const [verifyResult, setVerifyResult] = useState(null);
    const [issuedCertificateId, setIssuedCertificateId] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (isInitialized) {
            const stateToSave = {
                account,
                collegeName,
                requestStatus,
                accreditationProof,
                accreditationSignature,
                studentName,
                course,
                rollNo,
                dateOfIssuing,
                canIssue,
                verifyId,
                issuedCertificateId
            };
            localStorage.setItem('certificateRegistryState', JSON.stringify(stateToSave));
        }
    }, [
        account, collegeName, requestStatus, accreditationProof, 
        accreditationSignature, studentName, course, rollNo, 
        dateOfIssuing, canIssue, verifyId, issuedCertificateId, isInitialized
    ]);

    // Load state from localStorage on initial render
    useEffect(() => {
        const savedState = localStorage.getItem('certificateRegistryState');
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
                
                // If there was a connected account, try to reconnect
                if (parsedState.account) {
                    reconnectWallet(parsedState.account);
                }
            } catch (error) {
                console.error('Error loading saved state:', error);
                setStatus({ type: 'error', message: 'Error loading saved state. Please reconnect your wallet.' });
            }
        }
        setIsInitialized(true);
    }, []);

    // Function to reconnect wallet when page is refreshed
    const reconnectWallet = async (savedAccount) => {
        if (!window.ethereum) {
            setStatus({ type: 'error', message: "MetaMask is not installed." });
            return;
        }
        
        setLoading('connect', true);
        setStatus({ type: 'info', message: "Reconnecting to wallet..." });
        
        try {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(web3Provider);
            
            // Check if the saved account is still available in MetaMask
            const accounts = await web3Provider.send("eth_accounts", []);
            
            if (accounts.includes(savedAccount)) {
                setAccount(savedAccount);
                await handleCheckStatus(savedAccount);
                setStatus({ type: 'success', message: 'Wallet reconnected successfully!' });
            } else {
                // Account not found, reset state
                localStorage.removeItem('certificateRegistryState');
                setStatus({ type: 'info', message: 'Saved account not found. Please connect your wallet.' });
            }
        } catch (err) {
            console.error('Error reconnecting wallet:', err);
            setStatus({ type: 'error', message: "Failed to reconnect wallet. Please connect manually." });
        } finally {
            setLoading('connect', false);
        }
    };

    useEffect(() => { setCanIssue(false); }, [studentName, course, rollNo]);
    const generateContentHash = (collegeAddress, rollNo) => ethers.solidityPackedKeccak256(["address", "string"], [collegeAddress, rollNo.toLowerCase()]);
    const setLoading = (key, value) => setLoadingStates(prev => ({ ...prev, [key]: value }));
    async function connectWallet() {
        if (!window.ethereum) return setStatus({ type: 'error', message: "MetaMask is not installed." });
        setLoading('connect', true);
        setStatus({ type: 'info', message: "Connecting to wallet..." });
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
        // Clear all wallet-related state
        setAccount(null);
        setProvider(null);
        setStatus({ type: 'info', message: 'Wallet disconnected. Connect to begin.' });
        setRequestStatus('idle');
        setAccreditationProof(null);
        setAccreditationSignature(null);
        setCanIssue(false);
        setVerifyResult(null);
        setIssuedCertificateId(null);
        
        // Clear all form data
        setCollegeName("");
        setStudentName("");
        setCourse("");
        setRollNo("");
        setDateOfIssuing(new Date().toISOString().slice(0, 10));
        setVerifyId("");
        
        // Clear localStorage
        localStorage.removeItem('certificateRegistryState');
    }
    async function handleRequestAccreditation() {
        if (!account || !collegeName) return setStatus({ type: 'error', message: "Please connect wallet and enter college name." });
        setLoading('request', true);
        setStatus({ type: 'pending', message: "Submitting request for review..." });
        try {
            const res = await fetch(`${backendURL}/api/request-accreditation`, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collegeAddress: account, collegeName }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Server responded with status: ${res.status}`);
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
        setStatus({ type: 'info', message: "Checking accreditation status..." });
        try {
            const res = await fetch(`${backendURL}/api/check-status/${checkAddress}`);
            if (res.status === 404) {
                setRequestStatus('idle');
                setStatus({ type: 'info', message: "You have not submitted a request yet. Please do so in Step 1." });
                return;
            }
            if (!res.ok) throw new Error(`Server responded with status: ${res.status}`);
            const data = await res.json();
            if (data.status === 'approved') {
                setRequestStatus('approved');
                setAccreditationProof(data.proof);
                setAccreditationSignature(data.signature);
                setStatus({ type: 'success', message: "Accreditation approved! You can now issue certificates." });
            } else if (data.status === 'pending') {
                setRequestStatus('pending');
                setStatus({ type: 'pending', message: "Your request is still pending review." });
            } else if (data.status === 'rejected') {
                setRequestStatus('rejected');
                setStatus({ type: 'error', message: "Your accreditation request was rejected." });
            }
        } catch (err) {
            setStatus({ type: 'error', message: `Error checking status: ${err.message}` });
        } finally {
            setLoading('checkStatus', false);
        }
    }
    
    async function handleCheckDuplicate() {
        if (!rollNo) return setStatus({ type: 'error', message: "Please enter a Roll Number to check." });
        setLoading('checkDuplicate', true);
        setStatus({ type: 'info', message: "Checking for duplicate certificate..." });
        try {
            const res = await fetch(`${backendURL}/api/check-duplicate`, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collegeAddress: account, rollNo }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Server responded with status: ${res.status}`);
            if (data.isDuplicate) {
                setCanIssue(false);
                setStatus({ type: 'error', message: `Duplicate Found: ${data.message}` });
            } else {
                setCanIssue(true);
                setStatus({ type: 'success', message: "This roll number is unique. You can now issue." });
            }
        } catch (err) {
            setStatus({ type: 'error', message: `Error: ${err.message}` });
        } finally {
            setLoading('checkDuplicate', false);
        }
    }
    async function handleIssueCertificate() {
        if (!canIssue) return setStatus({ type: 'error', message: "Please run a successful duplicate check first." });
        if (!studentName || !course || !rollNo || !dateOfIssuing) return setStatus({ type: 'error', message: "All certificate fields are required." });
        setLoading('issue', true);
        setStatus({ type: 'info', message: "Preparing on-chain transaction..." });
        try {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, AccreditationRegistryABI.abi, signer);
            const certificateId = 'cert-' + Math.random().toString(36).substring(2, 15);
            const contentHash = generateContentHash(account, rollNo);
            
            try {
                setStatus({ type: 'info', message: "Waiting for MetaMask confirmation..." });
                const tx = await contract.createCertificateWithProof(certificateId, studentName, course, rollNo, dateOfIssuing, contentHash, accreditationProof.collegeName, accreditationProof.validUntil, accreditationSignature);
                
                // Format transaction hash for display - show first 6 and last 4 characters
                const formattedTxHash = `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`;
                setStatus({ type: 'pending', message: `Transaction sent: ${formattedTxHash}. Waiting for confirmation...` });
                
                try {
                    const receipt = await tx.wait();
                    setStatus({ type: 'success', message: "Certificate issued! Syncing..." });
                    await fetch(`${backendURL}/api/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ certificateId, txHash: receipt.hash }) });
                    setStatus({ type: 'success', message: "Certificate created successfully" });
                    setIssuedCertificateId(certificateId);
                    setCanIssue(false);
                } catch (receiptError) {
                    // Handle errors while waiting for receipt
                    if (receiptError.code === 4001 || 
                        (receiptError.message && receiptError.message.includes("user rejected transaction")) || 
                        (receiptError.message && receiptError.message.includes("transaction rejected")) ||
                        (receiptError.message && receiptError.message.includes("User denied transaction signature"))) {
                        setStatus({ type: 'error', message: "User cancelled payment from MetaMask" });
                    } else {
                        throw receiptError;
                    }
                }
            } catch (txError) {
                // Handle errors when sending the transaction
                if (txError.code === 4001 || 
                    (txError.message && txError.message.includes("user rejected transaction")) || 
                    (txError.message && txError.message.includes("transaction rejected")) ||
                    (txError.message && txError.message.includes("User denied transaction signature")) ||
                    (txError.message && txError.message.includes("MetaMask Tx Signature: User denied transaction signature"))) {
                    setStatus({ type: 'error', message: "User cancelled payment from MetaMask" });
                } else {
                    throw txError;
                }
            }
        } catch (err) {
            setStatus({ type: 'error', message: `Error: ${err.reason || err.message}` });
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
            case 'pending': return (<div><p>Your request is pending administrator approval.</p><button onClick={() => handleCheckStatus()} className="btn btn-secondary" disabled={loadingStates.checkStatus}>{loadingStates.checkStatus ? <Loader /> : 'Check Status'}</button></div>);
            case 'approved': return (<div><p>Your accreditation is approved! You can now proceed to the next step.</p></div>);
            case 'rejected': return (<div><p>Your request was denied. Please contact the administrator for more information.</p></div>);
            default: return (<div className="card-content"><p>Enter your college's name to request accreditation from the administrator.</p><IconInput icon={Icons.accreditation} placeholder="Your College Name" value={collegeName} onChange={e => setCollegeName(e.target.value)} /><button onClick={handleRequestAccreditation} className="btn btn-primary" disabled={!account || !collegeName || loadingStates.request}>{loadingStates.request ? <Loader /> : 'Request Accreditation'}</button></div>);
        }
    };
    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-pattern"></div>
                <div className="sidebar-header">
                    <div className="sidebar-logo"></div>
                    <h2>Certificate Registry</h2>
                </div>
                {account ? (
                    <>
                        <div className="wallet-connected">
                            <span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
                            <button onClick={disconnectWallet} className="btn btn-danger">Disconnect</button>
                        </div>
                    </>
                ) : (
                    <button onClick={connectWallet} className="btn btn-primary" disabled={loadingStates.connect}>
                        {loadingStates.connect ? <Loader /> : "Connect Wallet"}
                    </button>
                )}
                <StatusDisplay status={status} />
                <div className="sidebar-advanced-pattern"></div>
            </aside>
            <main className="main-content">
                <div className="page-header">
                    <h1>Admin Dashboard</h1>
                    <p>Manage accreditation, issue, and verify decentralized certificates.</p>
                </div>
                <div className="card-grid">
                    <section className="card">
                        <div className="card-header">
                            <div className="card-icon">{Icons.accreditation}</div>
                            <h3 className="card-title">Step 1: Get Accredited</h3>
                        </div>
                        {renderAccreditationContent()}
                    </section>
                    
                    <section className={`card ${requestStatus !== 'approved' ? 'disabled' : ''}`}>
                        <div className="card-header">
                            <div className="card-icon">{Icons.issue}</div>
                            <h3 className="card-title">Step 2: Issue Certificate</h3>
                        </div>
                        <div className="card-content">
                            <IconInput icon={Icons.user} placeholder="Student Name (e.g., Jane Doe)" value={studentName} onChange={e => setStudentName(e.target.value)} />
                            <IconInput icon={Icons.course} placeholder="Course Name (e.g., Intro to AI)" value={course} onChange={e => setCourse(e.target.value)} />
                            <IconInput icon={Icons.rollNo} placeholder="Roll Number (e.g., A-007)" value={rollNo} onChange={e => setRollNo(e.target.value)} />
                            <IconInput icon={<></>} type="date" value={dateOfIssuing} onChange={e => setDateOfIssuing(e.target.value)} />
                            <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                                <button onClick={handleCheckDuplicate} className="btn btn-secondary" disabled={!rollNo || loadingStates.checkDuplicate}>{loadingStates.checkDuplicate && <Loader />}Check Duplicate</button>
                                <button onClick={handleIssueCertificate} className="btn btn-primary" disabled={!canIssue || loadingStates.issue}>{loadingStates.issue && <Loader />}Issue On-Chain</button>
                            </div>
                            {issuedCertificateId && (
                                <div className="certificate-id-display" style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#e6f7e6', borderRadius: '4px', border: '1px solid #c3e6c3' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        {Icons.success}
                                        <strong style={{ marginLeft: '0.5rem' }}>Certificate Created Successfully!</strong>
                                    </div>
                                    <div>
                                        <strong>Certificate ID:</strong> {issuedCertificateId}
                                    </div>
                                </div>
                            )}
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
                            {verifyResult && (<div className="verify-result"><p>{verifyResult.message}</p>{verifyResult.certificate && (<pre>{JSON.stringify(verifyResult.certificate, null, 2)}</pre>)}</div>)}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}