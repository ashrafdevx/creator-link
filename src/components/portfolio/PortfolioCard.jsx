import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Play, Eye } from 'lucide-react';

export default function PortfolioCard({ item }) {
  const isVideo = item.video_url && (
    item.video_url.includes('youtube.com') || 
    item.video_url.includes('youtu.be') ||
    item.video_url.includes('vimeo.com')
  );

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group overflow-hidden">
      <div className="relative">
        {item.thumbnail_url && (
          <div className="aspect-video bg-slate-700 overflow-hidden">
            <img 
              src={item.thumbnail_url} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-slate-900 ml-1" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h4 className="font-semibold text-white mb-2 line-clamp-2">{item.title}</h4>
        
        {item.description && (
          <p className="text-sm text-slate-400 mb-3 line-clamp-2">{item.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          {item.channel_name && (
            <Badge variant="outline" className="text-xs">
              {item.channel_name}
            </Badge>
          )}
          {item.view_count && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {item.view_count}
            </Badge>
          )}
        </div>
        
        {item.video_url && (
          <a 
            href={item.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View {isVideo ? 'Video' : 'Project'}
          </a>
        )}
      </CardContent>
    </Card>
  );
}