import { useState } from 'react';
import { Key, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ApiKeyInputProps {
  onSubmit: (apiKey: string) => void;
}

const ApiKeyInput = ({ onSubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-2xl border border-border p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Weather Map</h1>
          <p className="text-muted-foreground">
            Enter your Mapbox API key to view the interactive map
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium text-foreground">
              Mapbox API Key
            </label>
            <Input
              id="apiKey"
              type="text"
              placeholder="pk.eyJ1..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Launch Map
          </Button>
        </form>

        <div className="space-y-3 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Don't have a Mapbox key?
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open('https://account.mapbox.com/access-tokens/', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Get Free API Key
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            For production use, consider enabling{' '}
            <span className="font-semibold text-primary">Lovable Cloud</span> for secure API key storage
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;
