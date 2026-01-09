import React, { useState } from 'react';
import BaseLayout from '../components/Layout/BaseLayout';
import ForgotForm1 from '../components/ForgotForm1';
import ForgotForm2 from '../components/ForgotForm2';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 — ввод email, 2 — ввод кода и пароля
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleEmailSubmitted = (email) => {
    setSubmittedEmail(email);
    setStep(2);
  };

  return (
    <BaseLayout>
      {step === 1 ? (
        <ForgotForm1 onEmailSubmitted={handleEmailSubmitted} />
      ) : (
        <ForgotForm2 email={submittedEmail} />
      )}
    </BaseLayout>
  );
};

export default ForgotPassword;