import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Brain, Target } from 'lucide-react';
import type { AdaptiveQuizSettings } from '@/lib/AdaptiveQuizEngine';
import { defaultAdaptiveSettings } from '@/lib/quiz-constants';

interface AdaptiveSettingsProps {
  settings: AdaptiveQuizSettings;
  onSettingsChange: (settings: AdaptiveQuizSettings) => void;
}

export function AdaptiveSettings({ settings = defaultAdaptiveSettings, onSettingsChange }: AdaptiveSettingsProps) {
  const [localSettings, setLocalSettings] = useState<AdaptiveQuizSettings>(settings);

  const updateSetting = <K extends keyof AdaptiveQuizSettings>(
    key: K,
    value: AdaptiveQuizSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="space-y-6">
      {/* Basic Adaptive Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Tetapan Asas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ability tracking is always enabled for full adaptation */}
          {/* Hints are disabled for now - can be added later if needed */}

          <div>
            <Label>Jumlah Soalan Maksimum</Label>
            <Input
              type="number"
              min="5"
              max="50"
              value={localSettings.maxQuestions}
              onChange={(e) => updateSetting('maxQuestions', parseInt(e.target.value))}
            />
          </div>

          <div>
            <Label>Had Masa (minit)</Label>
            <Input
              type="number"
              min="5"
              max="120"
              value={localSettings.timeLimit || ''}
              onChange={(e) => updateSetting('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>
      </Card>

      {/* Scoring Rules */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Peraturan Penskoran</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Mata untuk Jawapan Betul</Label>
            <Input
              type="number"
              min="1"
              value={localSettings.scoringRules.correctPoints}
              onChange={(e) => updateSetting('scoringRules', {
                ...localSettings.scoringRules,
                correctPoints: parseInt(e.target.value)
              })}
            />
          </div>

          <div>
            <Label>Penalti untuk Jawapan Salah</Label>
            <Input
              type="number"
              min="0"
              value={localSettings.scoringRules.incorrectPenalty}
              onChange={(e) => updateSetting('scoringRules', {
                ...localSettings.scoringRules,
                incorrectPenalty: parseInt(e.target.value)
              })}
            />
          </div>

          <div>
            <Label>Bonus Masa</Label>
            <Input
              type="number"
              min="0"
              value={localSettings.scoringRules.timeBonus}
              onChange={(e) => updateSetting('scoringRules', {
                ...localSettings.scoringRules,
                timeBonus: parseInt(e.target.value)
              })}
            />
          </div>

          <div>
            <Label>Penalti Petunjuk</Label>
            <Input
              type="number"
              min="0"
              value={localSettings.scoringRules.hintPenalty}
              onChange={(e) => updateSetting('scoringRules', {
                ...localSettings.scoringRules,
                hintPenalty: parseInt(e.target.value)
              })}
            />
          </div>
        </div>
      </Card>

      {/* Question Distribution */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold">Taburan Soalan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Jumlah Soalan Mudah</Label>
            <Input
              type="number"
              min="0"
              value={localSettings.questionDistribution?.easy || 0}
              onChange={(e) => updateSetting('questionDistribution', {
                easy: parseInt(e.target.value) || 0,
                medium: localSettings.questionDistribution?.medium || 0,
                hard: localSettings.questionDistribution?.hard || 0
              })}
            />
          </div>

          <div>
            <Label>Jumlah Soalan Sederhana</Label>
            <Input
              type="number"
              min="0"
              value={localSettings.questionDistribution?.medium || 0}
              onChange={(e) => updateSetting('questionDistribution', {
                easy: localSettings.questionDistribution?.easy || 0,
                medium: parseInt(e.target.value) || 0,
                hard: localSettings.questionDistribution?.hard || 0
              })}
            />
          </div>

          <div>
            <Label>Jumlah Soalan Sukar</Label>
            <Input
              type="number"
              min="0"
              value={localSettings.questionDistribution?.hard || 0}
              onChange={(e) => updateSetting('questionDistribution', {
                easy: localSettings.questionDistribution?.easy || 0,
                medium: localSettings.questionDistribution?.medium || 0,
                hard: parseInt(e.target.value) || 0
              })}
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Jumlah Keseluruhan:</strong> {
              (localSettings.questionDistribution?.easy || 0) +
              (localSettings.questionDistribution?.medium || 0) +
              (localSettings.questionDistribution?.hard || 0)
            } soalan
          </p>
        </div>
      </Card>

      {/* Adaptive Algorithms */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Algoritma Adaptif</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Pelarasan Kesukaran</Label>
            <Select
              value={localSettings.difficultyAdjustment}
              onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') =>
                updateSetting('difficultyAdjustment', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Konservatif</SelectItem>
                <SelectItem value="moderate">Sederhana</SelectItem>
                <SelectItem value="aggressive">Agresif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
}
