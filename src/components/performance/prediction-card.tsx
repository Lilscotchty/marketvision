import React from 'react';
import styled from 'styled-components';
import type { HistoricalPrediction } from '@/types';
import { TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface PredictionCardProps {
  prediction: HistoricalPrediction;
  onFlag: (predictionId: string, flag: 'successful' | 'unsuccessful') => void;
  onDelete: (predictionId: string) => void;
}

const PredictionCard = ({ prediction, onFlag, onDelete }: PredictionCardProps) => {
  const { id, prediction: predData, analysis, asset, date, imagePreviewUrl, manualFlag } = prediction;

  const summaryText = analysis?.summary || 'No analysis summary available.';
  const marketDirection = predData?.marketDirection || 'NEUTRAL';

  const DirectionIcon = 
    marketDirection === 'UP' ? <TrendingUp className="h-6 w-6 text-green-500" /> :
    marketDirection === 'DOWN' ? <TrendingDown className="h-6 w-6 text-red-500" /> :
    <Minus className="h-6 w-6 text-yellow-500" />;

  const handleFlagClick = (e: React.MouseEvent, flag: 'successful' | 'unsuccessful') => {
    e.stopPropagation();
    e.preventDefault();
    onFlag(id, flag);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onDelete(id);
  }

  return (
    <StyledWrapper>
      <div className="card">
        <div className="content">
          <div className="back">
            <div className="back-content">
              {DirectionIcon}
              <strong>{marketDirection}</strong>
            </div>
          </div>
          <div className="front">
            <div className="img">
              {imagePreviewUrl && <Image src={imagePreviewUrl} alt={asset || 'chart'} layout="fill" objectFit="cover" />}
              <div className="circle"></div>
              <div className="circle" id="right"></div>
              <div className="circle" id="bottom"></div>
            </div>
            <div className="front-content">
              <small className="badge">{asset}</small>
              <div className="description">
                <div className="title">
                  <p className="title">
                    <strong>{new Date(date).toLocaleDateString()}</strong>
                  </p>
                  <svg fillRule="nonzero" height="15px" width="15px" viewBox="0,0,256,256" xmlnsXlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g style={{mixBlendMode: 'normal'}} textAnchor="none" fontSize="none" fontWeight="none" fontFamily="none" strokeDashoffset={0} strokeDasharray="" strokeMiterlimit={10} strokeLinejoin="miter" strokeLinecap="butt" strokeWidth={1} stroke="none" fillRule="nonzero" fill="#20c997"><g transform="scale(8,8)"><path d="M25,27l-9,-6.75l-9,6.75v-23h18z" /></g></g></svg>
                </div>
                <p className="card-footer">
                  {summaryText.substring(0, 50)}{summaryText.length > 50 ? '...' : ''}
                </p>
                <div className="flag-buttons">
                  <button 
                    className="flag-btn successful" 
                    onClick={(e) => handleFlagClick(e, 'successful')}
                    title="Mark as Successful"
                  >
                    <ThumbsUp size={12} />
                  </button>
                  <button 
                    className="flag-btn unsuccessful" 
                    onClick={(e) => handleFlagClick(e, 'unsuccessful')}
                    title="Mark as Unsuccessful"
                  >
                    <ThumbsDown size={12} />
                  </button>
                   <button 
                    className="flag-btn delete" 
                    onClick={handleDeleteClick}
                    title="Delete Prediction"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {manualFlag && (
                  <small className={`badge-sm ${manualFlag}`}>
                    {manualFlag}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    overflow: visible;
    width: 190px;
    height: 254px;
  }

  .content {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 300ms;
    box-shadow: 0px 0px 10px 1px #000000ee;
    border-radius: var(--radius);
  }

  .front, .back {
    background-color: hsl(var(--card));
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: var(--radius);
    overflow: hidden;
  }

  .back {
    width: 100%;
    height: 100%;
    justify-content: center;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .back::before {
    position: absolute;
    content: ' ';
    display: block;
    width: 160px;
    height: 160%;
    background: linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--primary)), hsl(var(--primary)), hsl(var(--primary)), transparent);
    animation: rotation_481 5000ms infinite linear;
  }

  .back-content {
    position: absolute;
    width: 99%;
    height: 99%;
    background-color: hsl(var(--card));
    border-radius: 5px;
    color: hsl(var(--card-foreground));
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
  }
  
  .card:hover .content {
    transform: rotateY(180deg);
  }

  @keyframes rotation_481 {
    0% {
      transform: rotateZ(0deg);
    }

    100% {
      transform: rotateZ(360deg);
    }
  }

  .front {
    transform: rotateY(180deg);
    color: hsl(var(--card-foreground));
  }

  .front .front-content {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .front-content .badge {
    background-color: hsla(var(--card-foreground) / 0.5);
    padding: 2px 10px;
    border-radius: 10px;
    backdrop-filter: blur(2px);
    width: fit-content;
    color: hsl(var(--card));
  }
  
  .badge-sm {
      background-color: hsla(var(--muted-foreground) / 0.7);
      padding: 2px 8px;
      border-radius: 10px;
      width: fit-content;
      color: hsl(var(--card));
      font-size: 9px;
      text-transform: capitalize;
      margin-top: 4px;
      align-self: center;
  }
  
  .badge-sm.successful {
      background-color: rgba(40, 167, 69, 0.7);
  }
  
  .badge-sm.unsuccessful {
      background-color: rgba(220, 53, 69, 0.7);
  }


  .description {
    box-shadow: 0px 0px 10px 5px hsla(var(--card-foreground) / 0.1);
    width: 100%;
    padding: 10px;
    background-color: hsla(var(--card-foreground) / 0.2);
    backdrop-filter: blur(5px);
    border-radius: 5px;
    display: flex;
    flex-direction: column;
  }

  .title {
    font-size: 11px;
    max-width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .title p {
    width: 50%;
  }

  .card-footer {
    color: hsla(var(--card-foreground) / 0.8);
    margin-top: 5px;
    font-size: 8px;
    min-height: 24px; /* Ensure space for 3 lines */
  }

  .flag-buttons {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    justify-content: center;
  }

  .flag-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background-color: hsla(var(--muted-foreground) / 0.1);
    color: hsl(var(--muted-foreground));
    transition: all 0.2s ease;
  }

  .flag-btn:hover {
    transform: scale(1.1);
  }
  
  .flag-btn.successful:hover {
    background-color: rgba(40, 167, 69, 0.2);
    color: #28a745;
  }

  .flag-btn.unsuccessful:hover {
    background-color: rgba(220, 53, 69, 0.2);
     color: #dc3545;
  }
  
  .flag-btn.delete:hover {
    color: hsl(var(--destructive));
    background-color: hsla(var(--destructive) / 0.1);
  }

  .front .img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .circle {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background-color: hsl(var(--primary));
    position: relative;
    filter: blur(15px);
    animation: floating 2600ms infinite linear;
  }

  #bottom {
    background-color: hsl(var(--accent));
    left: 50px;
    top: 0px;
    width: 150px;
    height: 150px;
    animation-delay: -800ms;
  }

  #right {
    background-color: hsl(var(--destructive));
    left: 160px;
    top: -80px;
    width: 30px;
    height: 30px;
    animation-delay: -1800ms;
  }

  @keyframes floating {
    0% {
      transform: translateY(0px);
    }

    50% {
      transform: translateY(10px);
    }

    100% {
      transform: translateY(0px);
    }
  }
`;

export default PredictionCard;
