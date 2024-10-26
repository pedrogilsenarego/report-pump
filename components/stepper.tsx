type Props = {
  totalSteps: number;
  currentStep: number;
};

export default function StepperCounter(props: Props) {
  const { totalSteps, currentStep } = props;

  return (
    <div className="w-full flex items-center justify-center">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`h-12 w-12 rounded-full flex justify-center items-center ${
              index < currentStep ? "bg-primary" : "bg-secondary"
            }`}
            style={{
              margin: "5px",
              color: index < currentStep ? "white" : "gray",
            }}
          >
            {index + 1}
          </div>

          {index + 1 < totalSteps && (
            <div className="w-20 h-1 bg-primary mx-2 rounded-lg"></div>
          )}
        </div>
      ))}
    </div>
  );
}
