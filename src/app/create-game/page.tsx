"use client";

import React, { useState } from "react";
import Step1 from "./features/Step1";
import Step2 from "./features/Step2";
import Image from "next/image";
import Link from "next/link";
import { Character } from "./features/Step2";
import Step3 from './features/Step3';
import { useRouter } from "next/navigation";

function CreateGameMultiStepForm() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [step1Value, setStep1Value] = useState<number>(0);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const router = useRouter()

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () =>
    setCurrentStep((prev) => (prev <= 0 || prev === 1 ? 1 : prev - 1));

  const handleSubmit = () => {
    const formData = {
      name: step1Value,
      option: selectedCharacter,
    };
    console.log("Collected Data:", formData);
    alert("Form submitted successfully!");
    handleNext();
  };

  return (
    <div className="pt-4 h-full overflow-auto bg-background flex flex-col items-center px-5">
      <div>
      {currentStep === 3 ? (<></>) : (<div className="relative">
              <button onClick={handleBack} className="absolute top-0 left-0">
                {currentStep === 1 ? (
                  <Link href="/play">
                    <Image
                      src="/arrow-back.png"
                      alt="arrow-back"
                      width={30}
                      height={30}
                    />
                  </Link>
                ) : (
                  <Image
                    src="/arrow-back.png"
                    alt="arrow-back"
                    width={30}
                    height={30}
                  />
                )}
              </button>
            </div>)}
        {currentStep === 1 && (
          <div>
            <Step1 value={step1Value} onChange={setStep1Value} />
          </div>
        )}
        {currentStep === 2 && (
          <Step2 selectedItem={selectedCharacter} onSelect={setSelectedCharacter} />
        )}
        {currentStep === 3 && <Step3 />}
      </div>

      <div className="flex justify-center pb-[150px]">
        {currentStep < 2 && (
          <button
            className="bg-primary btn text-white h-12 rounded-[5px] w-[349px] mt-[35px]"
            onClick={handleNext}
            disabled={currentStep === 1 && !step1Value}
          >
            Set Stake
          </button>
        )}
        {currentStep === 2 && (
          <button
            className="bg-primary btn text-white h-12 rounded-[5px] w-[349px] mt-[35px]"
            onClick={handleSubmit}
            disabled={!selectedCharacter}
          >
            Next
          </button>
        )}
        {currentStep === 3 && (
          <button
            className="bg-white btn font-bold text-primary h-12 rounded-[5px] w-fit px-3 mt-[35px]"
            disabled={!selectedCharacter}
            onClick={() => router.push('/play')}
          >
            Home
          </button>
        )}
      </div>
    </div>
  );
}

export default CreateGameMultiStepForm;
