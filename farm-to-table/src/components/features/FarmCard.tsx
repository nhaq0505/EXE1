import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import type { Farm } from '../../mocks/mockData';
import { Card, CardContent } from '../ui/Card';

interface FarmCardProps {
  farm: Farm;
}

export const FarmCard: React.FC<FarmCardProps> = ({ farm }) => {
  return (
    <Link to={`/farms/${farm.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden hover:shadow-md transition-all duration-300 border-gray-100 group-hover:border-green-200">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={farm.image} 
            alt={farm.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors">
              {farm.name}
            </h3>
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="text-sm font-medium text-yellow-700">{farm.rating}</span>
            </div>
          </div>
          <div className="flex items-center text-gray-500 mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-sm truncate">{farm.location}</span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">
            {farm.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};
