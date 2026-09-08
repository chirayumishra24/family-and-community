import { useState } from 'react';
import { useGame } from '../../state/gameStore';
import './PrintableCertificate.css';

interface PrintableCertificateProps {
  onClose: () => void;
}

export default function PrintableCertificate({ onClose }: PrintableCertificateProps) {
  const { state } = useGame();
  const isHindi = state.settings.language === 'hi';

  const defaultStudent = state.teams.A.captain
    ? `${state.teams.A.captain} & ${state.teams.B.captain || state.teams.B.name}`
    : `${state.teams.A.name} & ${state.teams.B.name}`;

  const [studentName, setStudentName] = useState(defaultStudent);
  const [schoolName, setSchoolName] = useState('Govt. Model Senior Secondary School');
  const [teacherName, setTeacherName] = useState('Social Science Faculty');
  const [certDate, setCertDate] = useState(new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }));

  const handlePrint = () => {
    window.print();
  };

  const totalScore = state.teams.A.score + state.teams.B.score;

  return (
    <div className="cert-backdrop">
      <div className="cert-control-panel no-print">
        <div className="cert-inputs">
          <label>
            <span>{isHindi ? 'विद्यार्थी / टीम का नाम:' : 'Student / Team Name:'}</span>
            <input
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="e.g. Aarav, Priya & Team"
            />
          </label>
          <label>
            <span>{isHindi ? 'विद्यालय का नाम:' : 'School Name:'}</span>
            <input
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              placeholder="e.g. Kendriya Vidyalaya"
            />
          </label>
          <label>
            <span>{isHindi ? 'शिक्षक का नाम:' : 'Teacher / Guide:'}</span>
            <input
              value={teacherName}
              onChange={e => setTeacherName(e.target.value)}
              placeholder="e.g. Social Science Teacher"
            />
          </label>
        </div>
        <div className="cert-actions">
          <button className="btn btn-success cert-print-btn" onClick={handlePrint}>
            🖨️ {isHindi ? 'प्रमाण पत्र प्रिंट करें' : 'Print Certificate (A4)'}
          </button>
          <button className="btn btn-secondary cert-close-btn" onClick={onClose}>
            ✕ {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>

      {/* Actual Certificate Document to Print */}
      <div className="cert-document-wrapper">
        <div className="cert-border-outer">
          <div className="cert-border-inner">
            {/* Header / Seal */}
            <div className="cert-header">
              <div className="cert-ribbon">
                <span className="cert-seal">🏅</span>
              </div>
              <h4 className="cert-subheading">
                {isHindi ? 'राष्ट्रीय शैक्षिक अनुसंधान एवं सामाजिक विज्ञान पहल' : 'NATIONAL SOCIAL SCIENCE & CIVIC VALUES INITIATIVE'}
              </h4>
              <h1 className="cert-title">
                {isHindi ? 'नागरिक नेतृत्व प्रमाण पत्र' : 'CERTIFICATE OF CIVIC LEADERSHIP'}
              </h1>
              <p className="cert-grade">Grade 6 Social Science — Family & Community Quest</p>
            </div>

            {/* Presented To */}
            <div className="cert-body">
              <p className="cert-text-present">
                {isHindi ? 'यह प्रमाण पत्र गर्व के साथ प्रदान किया जाता है:' : 'THIS CERTIFICATE IS PROUDLY PRESENTED TO:'}
              </p>
              <div className="cert-recipient-name">
                {studentName || 'Exemplary Community Leader'}
              </div>
              <p className="cert-school-name">{schoolName}</p>

              <p className="cert-citation">
                {isHindi
                  ? `जिन्होंने 'द कम्युनिटी क्वेस्ट' में असाधारण नागरिक संवेदनशीलता, निष्पक्ष संसाधन वितरण, टीम सहयोग और ग्राम एवं नगर प्रशासन के सिद्धांतों का उत्कृष्ट प्रदर्शन करते हुए कुल ${totalScore} सामुदायिक अंक अर्जित किए हैं।`
                  : `For demonstrating exemplary civic awareness, democratic decision-making, equitable resource allocation, and collaborative problem-solving across all community institutions, amassing a grand community score of ${totalScore} points.`}
              </p>

              {/* Earned Badges Strip */}
              <div className="cert-badges-strip">
                <div className="cert-badge-item">
                  <span>🤝</span>
                  <strong>{isHindi ? 'आपसी सहयोग' : 'Cooperation'}</strong>
                </div>
                <div className="cert-badge-item">
                  <span>⚖️</span>
                  <strong>{isHindi ? 'समानता व न्याय' : 'Fairness & Equity'}</strong>
                </div>
                <div className="cert-badge-item">
                  <span>🔍</span>
                  <strong>{isHindi ? 'समस्या निवारण' : 'Problem Solving'}</strong>
                </div>
                <div className="cert-badge-item">
                  <span>🌳</span>
                  <strong>{isHindi ? 'पर्यावरण रक्षक' : 'Eco Guardian'}</strong>
                </div>
              </div>

              {/* Signatures */}
              <div className="cert-footer">
                <div className="cert-sig-block">
                  <div className="cert-sig-line"></div>
                  <p className="cert-sig-title">{teacherName}</p>
                  <p className="cert-sig-sub">{isHindi ? 'शिक्षक / मार्गदर्शक' : 'Social Science Educator'}</p>
                </div>

                <div className="cert-stamp">
                  <div className="cert-stamp-circle">
                    <span>SEAL OF</span>
                    <strong>CIVIC QUEST</strong>
                    <span>GRADE 6</span>
                  </div>
                </div>

                <div className="cert-sig-block">
                  <div className="cert-sig-line"></div>
                  <p className="cert-sig-title">{certDate}</p>
                  <p className="cert-sig-sub">{isHindi ? 'जारी करने की तिथि' : 'Date of Conferral'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
