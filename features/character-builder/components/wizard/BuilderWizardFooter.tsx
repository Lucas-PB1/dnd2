import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

type BuilderWizardFooterProps = {
  isFirstStep: boolean;
  isLastStep: boolean;
  canContinue: boolean;
  loading: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export function BuilderWizardFooter({
  isFirstStep,
  isLastStep,
  canContinue,
  loading,
  submitting,
  onBack,
  onNext,
  onSubmit,
}: BuilderWizardFooterProps) {
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="md"
        icon={<ArrowLeft className="size-4" />}
        className="w-auto!"
        disabled={isFirstStep || submitting || loading}
        onClick={onBack}
      >
        Voltar
      </Button>
      {isLastStep ? (
        <Button
          type="button"
          size="md"
          icon={<Sparkles className="size-4" />}
          loading={submitting}
          className="w-auto!"
          onClick={onSubmit}
        >
          Criar personagem
        </Button>
      ) : (
        <Button
          type="button"
          size="md"
          icon={<ArrowRight className="size-4" />}
          iconPosition="right"
          className="w-auto!"
          loading={loading}
          disabled={!canContinue}
          onClick={onNext}
        >
          Continuar
        </Button>
      )}
    </>
  );
}
