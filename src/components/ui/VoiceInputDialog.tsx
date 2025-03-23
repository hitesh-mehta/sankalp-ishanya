import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type FieldMetadata = {
  name: string;
  label: string;
  description: string;
  required: boolean;
  type: 'text' | 'number' | 'date' | 'email' | 'select';
  options?: { value: string, label: string }[];
};

export type TableConfig = {
  tableName: string;
  displayName: string;
  fields: FieldMetadata[];
};

const studentFields: FieldMetadata[] = [
  { name: 'first_name', label: 'First Name', description: 'Student\'s first name', required: true, type: 'text' },
  { name: 'last_name', label: 'Last Name', description: 'Student\'s last name', required: true, type: 'text' },
  { name: 'dob', label: 'Date of Birth', description: 'Format: YYYY-MM-DD (e.g., 2010-05-20)', required: true, type: 'date' },
  { name: 'gender', label: 'Gender', description: 'Student\'s gender', required: true, type: 'select', options: [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ]},
  { name: 'center_id', label: 'Center ID', description: 'Numeric ID of the center', required: true, type: 'number' },
  { name: 'program_id', label: 'Program ID', description: 'Numeric ID of the program', required: true, type: 'number' },
  { name: 'contact_number', label: 'Contact Number', description: 'Primary contact number', required: true, type: 'text' },
  { name: 'student_email', label: 'Student Email', description: 'Student\'s email address', required: false, type: 'email' },
  { name: 'parents_email', label: 'Parents Email', description: 'Parents\' email address', required: false, type: 'email' },
  { name: 'address', label: 'Address', description: 'Full address with city and pincode', required: false, type: 'text' },
  { name: 'primary_diagnosis', label: 'Primary Diagnosis', description: 'Primary medical diagnosis if applicable', required: false, type: 'text' },
  { name: 'enrollment_year', label: 'Enrollment Year', description: 'Year of enrollment (e.g., 2023)', required: true, type: 'number' },
];

const educatorFields: FieldMetadata[] = [
  { name: 'name', label: 'Full Name', description: 'Educator\'s full name', required: true, type: 'text' },
  { name: 'center_id', label: 'Center ID', description: 'Numeric ID of the center', required: true, type: 'number' },
  { name: 'program_id', label: 'Program ID', description: 'Numeric ID of the program', required: true, type: 'number' },
  { name: 'employee_id', label: 'Employee ID', description: 'Unique employee identifier', required: true, type: 'text' },
  { name: 'email', label: 'Email', description: 'Educator\'s email address', required: true, type: 'email' },
  { name: 'phone', label: 'Phone Number', description: 'Contact phone number', required: true, type: 'text' },
  { name: 'designation', label: 'Designation', description: 'Job title or position', required: true, type: 'text' },
  { name: 'date_of_birth', label: 'Date of Birth', description: 'Format: YYYY-MM-DD', required: true, type: 'date' },
  { name: 'date_of_joining', label: 'Date of Joining', description: 'Format: YYYY-MM-DD', required: true, type: 'date' },
];

const employeeFields: FieldMetadata[] = [
  { name: 'name', label: 'Full Name', description: 'Employee\'s full name', required: true, type: 'text' },
  { name: 'center_id', label: 'Center ID', description: 'Numeric ID of the center', required: true, type: 'number' },
  { name: 'employee_id', label: 'Employee ID', description: 'Unique employee identifier', required: true, type: 'text' },
  { name: 'email', label: 'Email', description: 'Employee\'s email address', required: true, type: 'email' },
  { name: 'phone', label: 'Phone Number', description: 'Contact phone number', required: true, type: 'text' },
  { name: 'designation', label: 'Designation', description: 'Job title or position', required: true, type: 'text' },
  { name: 'department', label: 'Department', description: 'Department name', required: true, type: 'text' },
  { name: 'date_of_birth', label: 'Date of Birth', description: 'Format: YYYY-MM-DD', required: true, type: 'date' },
  { name: 'date_of_joining', label: 'Date of Joining', description: 'Format: YYYY-MM-DD', required: true, type: 'date' },
];

export const tableConfigs: Record<string, TableConfig> = {
  students: {
    tableName: 'students',
    displayName: 'Student',
    fields: studentFields
  },
  educators: {
    tableName: 'educators',
    displayName: 'Educator',
    fields: educatorFields
  },
  employees: {
    tableName: 'employees',
    displayName: 'Employee',
    fields: employeeFields
  }
};

interface VoiceInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  table: string;
  onComplete: (data: Record<string, any>) => void;
}

const VoiceInputDialog = ({ isOpen, onClose, table, onComplete }: VoiceInputDialogProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [botMessage, setBotMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{type: 'bot' | 'user', message: string}>>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const tableConfig = tableConfigs[table] || tableConfigs.students;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCollectedData({});
      setConversationHistory([]);
      initializeSession();
    }
  }, [isOpen, table]);

  useEffect(() => {
    if (isOpen && currentStep === 0) {
      const welcomeMessage = `Hi there! I'll help you add a new ${tableConfig.displayName}. I'll ask you for each piece of information one by one. You can speak your answers after clicking the microphone button. If you don't have some information, just say "I don't know" or "skip" and we'll mark it as empty. Let's start!`;
      setBotMessage(welcomeMessage);
      setConversationHistory(prev => [...prev, {type: 'bot', message: welcomeMessage}]);
      
      setTimeout(() => {
        askForField(0);
      }, 1000);
    }
  }, [isOpen, currentStep, tableConfig]);

  const initializeSession = async () => {
    try {
      const { data, error } = await supabase
        .from('voice_sessions')
        .insert({
          table_name: table,
          status: 'in_progress'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data && data.id) {
        setCurrentSessionId(data.id);
      }
    } catch (error) {
      console.error('Error creating voice session:', error);
      toast.error('Failed to initialize voice entry session');
    }
  };

  const askForField = (index: number) => {
    if (index >= tableConfig.fields.length) {
      finishCollection();
      return;
    }
    
    const field = tableConfig.fields[index];
    const question = `Please tell me the ${field.label}${field.required ? ' (required)' : ''}. ${field.description}`;
    
    setBotMessage(question);
    setConversationHistory(prev => [...prev, {type: 'bot', message: question}]);
    setCurrentStep(index + 1);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      mediaRecorderRef.current.addEventListener('stop', processAudioData);

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingComplete(false);
      setCurrentTranscript('');
      toast.info('Recording started...');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingComplete(true);
      
      const tracks = mediaRecorderRef.current.stream.getTracks();
      tracks.forEach(track => track.stop());
      
      toast.info('Processing your voice...');
    }
  };

  const processAudioData = async () => {
    if (audioChunksRef.current.length === 0 || !tableConfig.fields[currentStep - 1]) return;
    
    setProcessing(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const currentField = tableConfig.fields[currentStep - 1];
        
        try {
          const response = await supabase.functions.invoke('speech-to-text', {
            body: {
              audio: base64Audio,
              currentField: currentField.name, 
              fieldContext: currentField.description,
              tableName: tableConfig.tableName
            }
          });
          
          if (response.error) throw new Error(response.error);
          
          let transcript = response.data.text.trim();
          setCurrentTranscript(transcript);
          
          setConversationHistory(prev => [...prev, {type: 'user', message: transcript}]);
          
          if (transcript === 'NULL_VALUE' || 
              transcript.toLowerCase().includes('i don\'t know') || 
              transcript.toLowerCase().includes('i don\'t have') ||
              transcript.toLowerCase().includes('skip')) {
            transcript = '';
            const skipMessage = `That's fine, we'll leave ${currentField.label} empty.`;
            setBotMessage(skipMessage);
            setConversationHistory(prev => [...prev, {type: 'bot', message: skipMessage}]);
          } else {
            if (currentField.type === 'number') {
              const numberMatch = transcript.match(/\d+/);
              if (numberMatch) {
                transcript = numberMatch[0];
              }
            } else if (currentField.type === 'date') {
              const dateMatch = transcript.match(/\d{4}-\d{2}-\d{2}/);
              if (!dateMatch) {
                if (transcript.includes('/')) {
                  const parts = transcript.split('/');
                  if (parts.length === 3) {
                    transcript = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                  }
                }
              }
            }
            
            const confirmMessage = `Got it! ${currentField.label}: ${transcript}`;
            setBotMessage(confirmMessage);
            setConversationHistory(prev => [...prev, {type: 'bot', message: confirmMessage}]);
          }
          
          setCollectedData(prev => ({
            ...prev,
            [currentField.name]: transcript
          }));
          
          if (currentSessionId) {
            await supabase
              .from('voice_sessions')
              .update({
                current_field: currentField.name,
                collected_data: { ...collectedData, [currentField.name]: transcript }
              })
              .eq('id', currentSessionId);
          }
          
          setTimeout(() => {
            askForField(currentStep);
          }, 1500);
        } catch (error) {
          console.error('Error processing speech:', error);
          toast.error('Failed to process speech. Please try again.');
          
          const errorMessage = 'Sorry, I couldn\'t understand that. Can you try again?';
          setBotMessage(errorMessage);
          setConversationHistory(prev => [...prev, {type: 'bot', message: errorMessage}]);
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio');
    } finally {
      setProcessing(false);
    }
  };

  const finishCollection = async () => {
    try {
      if (currentSessionId) {
        await supabase
          .from('voice_sessions')
          .update({
            status: 'completed',
            collected_data: collectedData
          })
          .eq('id', currentSessionId);
      }
      
      const completionMessage = `Great! We've collected all the information for the ${tableConfig.displayName}. Let me submit this for you.`;
      setBotMessage(completionMessage);
      setConversationHistory(prev => [...prev, {type: 'bot', message: completionMessage}]);
      
      const processedData = Object.entries(collectedData).reduce((acc, [key, value]) => {
        const fieldDef = tableConfig.fields.find(f => f.name === key);
        
        if (fieldDef) {
          if (fieldDef.type === 'number' && value !== '') {
            acc[key] = parseInt(value as string, 10);
          } else {
            acc[key] = value;
          }
        } else {
          acc[key] = value;
        }
        
        return acc;
      }, {} as Record<string, any>);
      
      if (processedData.center_id) {
        processedData.center_id = parseInt(processedData.center_id as string, 10);
      }
      if (processedData.program_id) {
        processedData.program_id = parseInt(processedData.program_id as string, 10);
      }
      
      if (!processedData.created_at) {
        processedData.created_at = new Date().toISOString();
      }
      
      setTimeout(() => {
        onComplete(processedData);
        
        setTimeout(() => {
          onClose();
        }, 1000);
      }, 2000);
    } catch (error) {
      console.error('Error finalizing voice session:', error);
      toast.error('Failed to complete the entry process');
    }
  };

  const isCurrentFieldRequired = () => {
    if (currentStep > 0 && currentStep <= tableConfig.fields.length) {
      const currentField = tableConfig.fields[currentStep - 1];
      return currentField.required;
    }
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-ishanya-green">
            <Sparkles className="h-5 w-5" />
            Voice-Assisted Data Entry
          </DialogTitle>
          <DialogDescription>
            Add a new {tableConfig.displayName} using voice commands. Step {currentStep} of {tableConfig.fields.length}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2">
          <Progress value={(currentStep / tableConfig.fields.length) * 100} className="h-2" />
        </div>
        
        <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto border rounded-md p-4 bg-gray-50">
          {conversationHistory.map((item, index) => (
            <div 
              key={index} 
              className={`flex ${item.type === 'bot' ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  item.type === 'bot' 
                    ? 'bg-ishanya-green text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {item.message}
              </div>
            </div>
          ))}
          
          {botMessage && currentStep > conversationHistory.length && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-ishanya-green text-white">
                {botMessage}
              </div>
            </div>
          )}
          
          {isRecording && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-pulse text-red-500">Recording...</div>
            </div>
          )}
          
          {processing && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Processing your speech...</span>
            </div>
          )}
          
          {currentTranscript && recordingComplete && !processing && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-200 text-gray-800">
                {currentTranscript}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-2 mt-4">
          <Button 
            variant="outline" 
            onClick={toggleRecording}
            disabled={processing || currentStep > tableConfig.fields.length}
            className={isRecording ? "bg-red-50 border-red-300 text-red-500" : ""}
          >
            {isRecording ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </>
            )}
          </Button>
          
          {currentStep > tableConfig.fields.length && (
            <Button 
              onClick={() => onComplete(collectedData)}
              className="bg-ishanya-green hover:bg-ishanya-green/90"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit
            </Button>
          )}
          
          {!isRecording && currentStep <= tableConfig.fields.length && currentStep > 0 && (
            <Button 
              variant="ghost" 
              onClick={() => askForField(currentStep)}
              disabled={processing || isCurrentFieldRequired()}
              className={`text-ishanya-green border-ishanya-green/20 ${isCurrentFieldRequired() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronRight className="mr-2 h-4 w-4" />
              Skip to Next
              {isCurrentFieldRequired() && <span className="text-xs ml-1">(Required)</span>}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceInputDialog;
