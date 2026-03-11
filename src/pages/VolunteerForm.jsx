// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
// import { ShieldCheck, ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
// import './VolunteerForm.css';

// const VolunteerForm = () => {
//     const navigate = useNavigate();
//     const [step, setStep] = useState(1);
//     const [formData, setFormData] = useState({
//         // 1. Basic Info
//         fullName: '',
//         age: '',
//         gender: '',
//         phone: '',
//         email: '',
//         location: '',
//         collegeDept: '',
//         // 2. Education
//         degree: '',
//         yearOfStudy: '',
//         fieldOfStudy: '',
//         // 3. Interest
//         whyVolunteer: '',
//         motivation: '',
//         // 4. Experience
//         experienceTypes: [],
//         experienceDescription: '',
//         // 5. Skills
//         qualities: [],
//         // 6. Availability
//         hoursPerWeek: '',
//         preferredTime: [],
//         // 7. Awareness
//         attendedWorkshops: '',
//         // 8. Emergency
//         understandsRole: false,
//         willingToEscalate: false,
//         // 9. Confidentiality
//         agreesToConfidentiality: false,
//         treatsWithRespect: false,
//         understandsGuidelines: false
//     });

//     const handleNext = () => setStep(prev => Math.min(prev + 1, 9));
//     const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         if (type === 'checkbox') {
//             if (name === 'experienceTypes' || name === 'qualities' || name === 'preferredTime') {
//                 const list = [...formData[name]];
//                 if (checked) list.push(value);
//                 else {
//                     const idx = list.indexOf(value);
//                     if (idx > -1) list.splice(idx, 1);
//                 }
//                 setFormData({ ...formData, [name]: list });
//             } else {
//                 setFormData({ ...formData, [name]: checked });
//             }
//         } else {
//             setFormData({ ...formData, [name]: value });
//         }
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         // Validation logic can go here
//         console.log("Submitting Volunteer Application:", formData);
//         alert("Thank you for your application! Our team will review it and get back to you soon.");
//         navigate('/dashboard/volunteer');
//     };

//     const renderStepContent = () => {
//         switch (step) {
//             case 1:
//                 return (
//                     <div className="vf-step-content">
//                         <h2 className="vf-step-title">1. Basic Information</h2>
//                         <div className="vf-form-grid">
//                             <div className="vf-input-group">
//                                 <label>Full Name</label>
//                                 <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full name" required />
//                             </div>
//                             <div className="vf-input-group">
//                                 <label>Age</label>
//                                 <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="Age" required />
//                             </div>
//                             <div className="vf-input-group">
//                                 <label>Gender (optional)</label>
//                                 <select name="gender" value={formData.gender} onChange={handleInputChange}>
//                                     <option value="">Select Gender</option>
//                                     <option value="male">Male</option>
//                                     <option value="female">Female</option>
//                                     <option value="other">Other</option>
//                                     <option value="prefer-not-to-say">Prefer not to say</option>
//                                 </select>
//                             </div>
//                             <div className="vf-input-group">
//                                 <label>Phone Number</label>
//                                 <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone number" required />
//                             </div>
//                             <div className="vf-input-group">
//                                 <label>Email Address</label>
//                                 <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email address" required />
//                             </div>
//                             <div className="vf-input-group">
//                                 <label>City / Location</label>
//                                 <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="City or town" required />
//                             </div>
//                             <div className="vf-input-group vf-full-width">
//                                 <label>College and Dept.</label>
//                                 <input type="text" name="collegeDept" value={formData.collegeDept} onChange={handleInputChange} placeholder="College and department" required />
//                             </div>
//                         </div>
//                     </div>
//                 );
//             case 2:
//                 return (
//                     <div className="vf-step-content">
//                         <h2 className="vf-step-title">2. Education Background</h2>
//                         <div className="vf-form-grid">
//                             <div className="vf-input-group">
//                                 <label>Current Course / Degree</label>
//                                 <input type="text" name="degree" value={formData.degree} onChange={handleInputChange} placeholder="Degree" required />
//                             </div>
//                             <div className="vf-input-group">
//                                 <label>Year of Study</label>
//                                 <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleInputChange} required>
//                                     <option value="">Select Year</option>
//                                     <option value="1">1st Year</option>
//                                     <option value="2">2nd Year</option>
//                                     <option value="3">3rd Year</option>
//                                     <option value="4">4th Year</option>
//                                     <option value="other">Post-Graduate / Other</option>
//                                 </select>
//                             </div>
//                             <div className="vf-input-group vf-full-width">
//                                 <label>Field of Study</label>
//                                 <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleInputChange} placeholder="Field of study" required />
//                             </div>
//                         </div>
//                     </div>
//                 );
//             case 3:
//                 return (
//                     <div className="vf-step-content">
//                         <h2 className="vf-step-title">3. Interest in Volunteering</h2>
//                         <div className="vf-input-group vf-full-width">
//                             <label>Why do you want to volunteer for Vyannaid?</label>
//                             <textarea name="whyVolunteer" value={formData.whyVolunteer} onChange={handleInputChange} rows="4" placeholder="Why do you want to join?" required />
//                         </div>
//                         <div className="vf-input-group vf-full-width">
//                             <label>What motivates you to support people with mental health challenges?</label>
//                             <textarea name="motivation" value={formData.motivation} onChange={handleInputChange} rows="4" placeholder="What motivates you?" required />
//                         </div>
//                     </div>
//                 );
//             case 4:
//                 return (
//                     <div className="vf-step-content">
//                         <h2 className="vf-step-title">4. Experience (Optional)</h2>
//                         <div className="vf-checkbox-grid">
//                             {['Counseling', 'Peer support', 'Volunteering', 'Psychology related training'].map(exp => (
//                                 <label key={exp} className="vf-checkbox-item">
//                                     <input type="checkbox" name="experienceTypes" value={exp} checked={formData.experienceTypes.includes(exp)} onChange={handleInputChange} />
//                                     <span>{exp}</span>
//                                 </label>
//                             ))}
//                         </div>
//                         <div className="vf-input-group vf-full-width">
//                             <label>If yes, please describe briefly.</label>
//                             <textarea name="experienceDescription" value={formData.experienceDescription} onChange={handleInputChange} rows="3" placeholder="Briefly describe your experience" />
//                         </div>
//                     </div>
//                 );
//             case 5:
//                 return (
//                     <div className="vf-step-content">
//                         <h2 className="vf-step-title">5. Skills & Qualities</h2>
//                         <div className="vf-checkbox-grid">
//                             {['Good Listener', 'Empathetic', 'Non-judgmental', 'Patient', 'Communication Skills'].map(quality => (
//                                 <label key={quality} className="vf-checkbox-item">
//                                     <input type="checkbox" name="qualities" value={quality} checked={formData.qualities.includes(quality)} onChange={handleInputChange} />
//                                     <span>{quality}</span>
//                                 </label>
//                             ))}
//                         </div>
//                     </div>
//                 );
//             case 6:
//                 return (
//                     <div className="vf-step-content">
//                         <h2 className="vf-step-title">6. Availability</h2>
//                         <div className="vf-input-group vf-full-width">
//                             <label>How many hours per week can you volunteer?</label>
//                             <input type="number" name="hoursPerWeek" value={formData.hoursPerWeek} onChange={handleInputChange} placeholder="Weekly hours" required />
//                         </div>
//                         <div className="vf-input-group vf-full-width">
//                             <label>Preferred time:</label>
//                             <div className="vf-checkbox-grid">
//                                 {['Morning', 'Afternoon', 'Evening', 'Late Night'].map(time => (
//                                     <label key={time} className="vf-checkbox-item">
//                                         <input type="checkbox" name="preferredTime" value={time} checked={formData.preferredTime.includes(time)} onChange={handleInputChange} />
//                                         <span>{time}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 );
//             case 7:
//                 return (
//                     <div className="vf-step-content">
//                         <h2 className="vf-step-title">7. Mental Health Awareness</h2>
//                         <div className="vf-input-group vf-full-width">
//                             <label>Have you attended any mental health workshops or training?</label>
//                             <div className="vf-radio-group">
//                                 <label><input type="radio" name="attendedWorkshops" value="yes" checked={formData.attendedWorkshops === 'yes'} onChange={handleInputChange} /> Yes</label>
//                                 <label><input type="radio" name="attendedWorkshops" value="no" checked={formData.attendedWorkshops === 'no'} onChange={handleInputChange} /> No</label>
//                             </div>
//                         </div>
//                     </div>
//                 );
//             case 8:
//                 return (
//                     <div className="vf-step-content">
//                         <h2 className="vf-step-title">8. Emergency Awareness</h2>
//                         <div className="vf-checkbox-vertical">
//                             <label className="vf-checkbox-item">
//                                 <input type="checkbox" name="understandsRole" checked={formData.understandsRole} onChange={handleInputChange} required />
//                                 <span>Do you understand that volunteers cannot replace professional therapists?</span>
//                             </label>
//                             <label className="vf-checkbox-item">
//                                 <input type="checkbox" name="willingToEscalate" checked={formData.willingToEscalate} onChange={handleInputChange} required />
//                                 <span>Are you willing to escalate serious cases to professionals?</span>
//                             </label>
//                         </div>
//                         <div className="vf-alert">
//                             <AlertCircle size={18} />
//                             <p>It is mandatory to acknowledge these points to become a peer volunteer.</p>
//                         </div>
//                     </div>
//                 );
//             case 9:
//                 return (
//                     <div className="vf-step-content">
//                         <h2 className="vf-step-title">9. Confidentiality Agreement</h2>
//                         <div className="vf-checkbox-vertical">
//                             <label className="vf-checkbox-item">
//                                 <input type="checkbox" name="agreesToConfidentiality" checked={formData.agreesToConfidentiality} onChange={handleInputChange} required />
//                                 <span>I agree to maintain user confidentiality.</span>
//                             </label>
//                             <label className="vf-checkbox-item">
//                                 <input type="checkbox" name="treatsWithRespect" checked={formData.treatsWithRespect} onChange={handleInputChange} required />
//                                 <span>I will treat users respectfully and without judgment.</span>
//                             </label>
//                             <label className="vf-checkbox-item">
//                                 <input type="checkbox" name="understandsGuidelines" checked={formData.understandsGuidelines} onChange={handleInputChange} required />
//                                 <span>I understand Vyannaid guidelines.</span>
//                             </label>
//                         </div>
//                     </div>
//                 );
//             default:
//                 return null;
//         }
//     };

//     return (
//         <DashboardLayout>
//             <div className="vf-container">
//                 <div className="vf-header">
//                     <button className="vf-back-btn" onClick={() => navigate('/dashboard/volunteer')}>
//                         <ArrowLeft size={18} /> <span>Back to Info</span>
//                     </button>
//                     <div className="vf-progress">
//                         <span className="vf-progress-text">Step {step} of 9</span>
//                         <div className="vf-progress-bar">
//                             <div className="vf-progress-fill" style={{ width: `${(step / 9) * 100}%` }}></div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="vf-card">
//                     <form onSubmit={handleSubmit}>
//                         {renderStepContent()}

//                         <div className="vf-actions">
//                             {step > 1 && (
//                                 <button type="button" className="vf-btn-secondary" onClick={handleBack}>
//                                     Previous
//                                 </button>
//                             )}
//                             {step < 9 ? (
//                                 <button type="button" className="vf-btn-primary" onClick={handleNext}>
//                                     Next Step <ArrowRight size={18} />
//                                 </button>
//                             ) : (
//                                 <button type="submit" className="vf-btn-primary vf-submit">
//                                     Submit Application <Check size={18} />
//                                 </button>
//                             )}
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </DashboardLayout>
//     );
// };

// export default VolunteerForm;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { ArrowLeft, ArrowRight, Check, AlertCircle, Loader } from 'lucide-react';
import { submitVolunteerApplication, getMyVolunteerApplication } from '../api/volunteerApi';
import './VolunteerForm.css';

const VolunteerForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingExisting, setCheckingExisting] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        location: '',
        collegeDept: '',
        degree: '',
        yearOfStudy: '',
        fieldOfStudy: '',
        whyVolunteer: '',
        motivation: '',
        experienceTypes: [],
        experienceDescription: '',
        qualities: [],
        hoursPerWeek: '',
        preferredTime: [],
        attendedWorkshops: '',
        understandsRole: false,
        willingToEscalate: false,
        agreesToConfidentiality: false,
        treatsWithRespect: false,
        understandsGuidelines: false
    });

    // On mount — redirect away if student already has an application
    useEffect(() => {
        getMyVolunteerApplication()
            .then(() => {
                // Already has an application — send them to the status page
                navigate('/dashboard/volunteer', { replace: true });
            })
            .catch((err) => {
                // 404 = no application yet — safe to show the form
                if (err.response?.status !== 404) {
                    setError('Something went wrong. Please try again.');
                }
            })
            .finally(() => setCheckingExisting(false));
    }, [navigate]);

    const handleNext = () => {
        setError('');
        setStep(prev => Math.min(prev + 1, 9));
    };
    const handleBack = () => {
        setError('');
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            if (['experienceTypes', 'qualities', 'preferredTime'].includes(name)) {
                const list = [...formData[name]];
                if (checked) list.push(value);
                else list.splice(list.indexOf(value), 1);
                setFormData({ ...formData, [name]: list });
            } else {
                setFormData({ ...formData, [name]: checked });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Step 9 mandatory checkbox validation
        if (!formData.understandsRole || !formData.willingToEscalate) {
            return setError('Please acknowledge both emergency awareness points.');
        }
        if (!formData.agreesToConfidentiality || !formData.treatsWithRespect || !formData.understandsGuidelines) {
            return setError('Please agree to all confidentiality terms.');
        }

        setLoading(true);
        try {
            // Convert age and hoursPerWeek to numbers before sending
            const payload = {
                ...formData,
                age: Number(formData.age),
                hoursPerWeek: Number(formData.hoursPerWeek),
            };
            await submitVolunteerApplication(payload);
            navigate('/dashboard/volunteer', {
                replace: true,
                state: { submitted: true }
            });
        } catch (err) {
            const msg = err.response?.data?.message || 'Submission failed. Please try again.';
            setError(msg);
            // If already has pending/approved — go back to status page
            if (err.response?.status === 409) {
                setTimeout(() => navigate('/dashboard/volunteer', { replace: true }), 1500);
            }
        } finally {
            setLoading(false);
        }
    };

    if (checkingExisting) {
        return (
            <DashboardLayout>
                <div className="vf-loading">
                    <Loader size={28} className="vf-spinner" />
                    <p>Checking application status…</p>
                </div>
            </DashboardLayout>
        );
    }

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="vf-step-content">
                        <h2 className="vf-step-title">1. Basic Information</h2>
                        <div className="vf-form-grid">
                            <div className="vf-input-group">
                                <label>Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full name" required />
                            </div>
                            <div className="vf-input-group">
                                <label>Age</label>
                                <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="Age" min="16" max="100" required />
                            </div>
                            <div className="vf-input-group">
                                <label>Gender (optional)</label>
                                <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>
                            <div className="vf-input-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone number" required />
                            </div>
                            <div className="vf-input-group">
                                <label>Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email address" required />
                            </div>
                            <div className="vf-input-group">
                                <label>City / Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="City or town" required />
                            </div>
                            <div className="vf-input-group vf-full-width">
                                <label>College and Dept.</label>
                                <input type="text" name="collegeDept" value={formData.collegeDept} onChange={handleInputChange} placeholder="College and department" required />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="vf-step-content">
                        <h2 className="vf-step-title">2. Education Background</h2>
                        <div className="vf-form-grid">
                            <div className="vf-input-group">
                                <label>Current Course / Degree</label>
                                <input type="text" name="degree" value={formData.degree} onChange={handleInputChange} placeholder="Degree" required />
                            </div>
                            <div className="vf-input-group">
                                <label>Year of Study</label>
                                <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleInputChange} required>
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                    <option value="other">Post-Graduate / Other</option>
                                </select>
                            </div>
                            <div className="vf-input-group vf-full-width">
                                <label>Field of Study</label>
                                <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleInputChange} placeholder="Field of study" required />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="vf-step-content">
                        <h2 className="vf-step-title">3. Interest in Volunteering</h2>
                        <div className="vf-input-group vf-full-width">
                            <label>Why do you want to volunteer for Vyannaid?</label>
                            <textarea name="whyVolunteer" value={formData.whyVolunteer} onChange={handleInputChange} rows="4" placeholder="Why do you want to join?" required />
                        </div>
                        <div className="vf-input-group vf-full-width">
                            <label>What motivates you to support people with mental health challenges?</label>
                            <textarea name="motivation" value={formData.motivation} onChange={handleInputChange} rows="4" placeholder="What motivates you?" required />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="vf-step-content">
                        <h2 className="vf-step-title">4. Experience (Optional)</h2>
                        <div className="vf-checkbox-grid">
                            {['Counseling', 'Peer support', 'Volunteering', 'Psychology related training'].map(exp => (
                                <label key={exp} className="vf-checkbox-item">
                                    <input type="checkbox" name="experienceTypes" value={exp} checked={formData.experienceTypes.includes(exp)} onChange={handleInputChange} />
                                    <span>{exp}</span>
                                </label>
                            ))}
                        </div>
                        <div className="vf-input-group vf-full-width">
                            <label>If yes, please describe briefly.</label>
                            <textarea name="experienceDescription" value={formData.experienceDescription} onChange={handleInputChange} rows="3" placeholder="Briefly describe your experience" />
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="vf-step-content">
                        <h2 className="vf-step-title">5. Skills & Qualities</h2>
                        <div className="vf-checkbox-grid">
                            {['Good Listener', 'Empathetic', 'Non-judgmental', 'Patient', 'Communication Skills'].map(quality => (
                                <label key={quality} className="vf-checkbox-item">
                                    <input type="checkbox" name="qualities" value={quality} checked={formData.qualities.includes(quality)} onChange={handleInputChange} />
                                    <span>{quality}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="vf-step-content">
                        <h2 className="vf-step-title">6. Availability</h2>
                        <div className="vf-input-group vf-full-width">
                            <label>How many hours per week can you volunteer?</label>
                            <input type="number" name="hoursPerWeek" value={formData.hoursPerWeek} onChange={handleInputChange} placeholder="Weekly hours" min="1" max="168" required />
                        </div>
                        <div className="vf-input-group vf-full-width">
                            <label>Preferred time:</label>
                            <div className="vf-checkbox-grid">
                                {['Morning', 'Afternoon', 'Evening', 'Late Night'].map(time => (
                                    <label key={time} className="vf-checkbox-item">
                                        <input type="checkbox" name="preferredTime" value={time} checked={formData.preferredTime.includes(time)} onChange={handleInputChange} />
                                        <span>{time}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 7:
                return (
                    <div className="vf-step-content">
                        <h2 className="vf-step-title">7. Mental Health Awareness</h2>
                        <div className="vf-input-group vf-full-width">
                            <label>Have you attended any mental health workshops or training?</label>
                            <div className="vf-radio-group">
                                <label><input type="radio" name="attendedWorkshops" value="yes" checked={formData.attendedWorkshops === 'yes'} onChange={handleInputChange} required /> Yes</label>
                                <label><input type="radio" name="attendedWorkshops" value="no" checked={formData.attendedWorkshops === 'no'} onChange={handleInputChange} /> No</label>
                            </div>
                        </div>
                    </div>
                );
            case 8:
                return (
                    <div className="vf-step-content">
                        <h2 className="vf-step-title">8. Emergency Awareness</h2>
                        <div className="vf-checkbox-vertical">
                            <label className="vf-checkbox-item">
                                <input type="checkbox" name="understandsRole" checked={formData.understandsRole} onChange={handleInputChange} />
                                <span>Do you understand that volunteers cannot replace professional therapists?</span>
                            </label>
                            <label className="vf-checkbox-item">
                                <input type="checkbox" name="willingToEscalate" checked={formData.willingToEscalate} onChange={handleInputChange} />
                                <span>Are you willing to escalate serious cases to professionals?</span>
                            </label>
                        </div>
                        <div className="vf-alert">
                            <AlertCircle size={18} />
                            <p>It is mandatory to acknowledge these points to become a peer volunteer.</p>
                        </div>
                    </div>
                );
            case 9:
                return (
                    <div className="vf-step-content">
                        <h2 className="vf-step-title">9. Confidentiality Agreement</h2>
                        <div className="vf-checkbox-vertical">
                            <label className="vf-checkbox-item">
                                <input type="checkbox" name="agreesToConfidentiality" checked={formData.agreesToConfidentiality} onChange={handleInputChange} />
                                <span>I agree to maintain user confidentiality.</span>
                            </label>
                            <label className="vf-checkbox-item">
                                <input type="checkbox" name="treatsWithRespect" checked={formData.treatsWithRespect} onChange={handleInputChange} />
                                <span>I will treat users respectfully and without judgment.</span>
                            </label>
                            <label className="vf-checkbox-item">
                                <input type="checkbox" name="understandsGuidelines" checked={formData.understandsGuidelines} onChange={handleInputChange} />
                                <span>I understand Vyannaid guidelines.</span>
                            </label>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="vf-container">
                <div className="vf-header">
                    <button className="vf-back-btn" onClick={() => navigate('/dashboard/volunteer')}>
                        <ArrowLeft size={18} /> <span>Back to Info</span>
                    </button>
                    <div className="vf-progress">
                        <span className="vf-progress-text">Step {step} of 9</span>
                        <div className="vf-progress-bar">
                            <div className="vf-progress-fill" style={{ width: `${(step / 9) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="vf-card">
                    {error && (
                        <div className="vf-error-banner">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {renderStepContent()}

                        <div className="vf-actions">
                            {step > 1 && (
                                <button type="button" className="vf-btn-secondary" onClick={handleBack} disabled={loading}>
                                    Previous
                                </button>
                            )}
                            {step < 9 ? (
                                <button type="button" className="vf-btn-primary" onClick={handleNext}>
                                    Next Step <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button type="submit" className="vf-btn-primary vf-submit" disabled={loading}>
                                    {loading ? <><Loader size={16} className="vf-spinner" /> Submitting…</> : <><Check size={18} /> Submit Application</>}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VolunteerForm;