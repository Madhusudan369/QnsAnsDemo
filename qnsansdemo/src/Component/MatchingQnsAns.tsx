import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from './MatchingQnsAns.module.css';

interface Service {
  id: number;
  name: string;
  matchedDescriptionId: number | null;
}

interface Description {
  id: number;
  text: string;
  correctServiceId: number;
}

const services: Service[] = [
  { id: 1, name: 'Azure Key Vault', matchedDescriptionId: null },
  { id: 2, name: 'Azure App Service', matchedDescriptionId: null },
  { id: 3, name: 'Azure Virtual Machines', matchedDescriptionId: null },
  { id: 4, name: 'Azure Blob Storage', matchedDescriptionId: null },
  { id: 5, name: 'Azure Cosmos DB', matchedDescriptionId: null },
  { id: 6, name: 'Azure Functions', matchedDescriptionId: null },
];

const descriptions: Description[] = [
  { id: 1, text: 'Enterprise-grade security for identities', correctServiceId: 0 },
  { id: 2, text: 'Host and scale web applications', correctServiceId: 2 },
  { id: 3, text: 'Event-driven serverless compute platform', correctServiceId: 6 },
  { id: 4, text: 'Securely store secrets and certificates', correctServiceId: 1 },
  { id: 5, text: 'Run virtualized operating systems', correctServiceId: 3 },
  { id: 6, text: 'Store unstructured data like images and videos', correctServiceId: 4 },
  { id: 7, text: 'Globally distributed, multi-model database service', correctServiceId: 5 },
  // No correct match
];

const ServiceItem = ({
  service,
  matchedDescription,
  onDrop,
  onRemove,
}: {
  service: Service;
  matchedDescription: Description | null;
  onDrop: (serviceId: number, descriptionId: number) => void;
  onRemove: (descriptionId: number) => void;
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'description',
    drop: (item: { id: number }) => {
      onDrop(service.id, item.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`${styles.serviceItem} ${isOver ? styles.serviceItemOver : ''}`}
    >
      <div className={styles.serviceName}>{service.name}</div>
      {matchedDescription && (
        <DraggableDescription 
          description={matchedDescription} 
          isMatched={true}
          isCorrect={matchedDescription.correctServiceId === service.id}
          onRemove={() => onRemove(matchedDescription.id)}
        />
      )}
    </div>
  );
};

const DraggableDescription = ({ 
  description, 
  isMatched = false, 
  isCorrect = true,
  onRemove
}: { 
  description: Description;
  isMatched?: boolean;
  isCorrect?: boolean;
  onRemove?: () => void;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'description',
    item: { id: description.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  return (
    <div
      ref={drag}
      className={`${styles.description} ${isDragging ? styles.descriptionDragging : ''} ${
        !isCorrect ? styles.descriptionIncorrect : ''
      }`}
    >
      {description.text}
      {isMatched && (
        <button 
          onClick={handleRemove}
          className={styles.removeButton}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default function MatchingQnsAns() {
  const [servicesState, setServicesState] = useState<Service[]>(services);
  const [unmatchedDescriptions, setUnmatchedDescriptions] = useState<Description[]>(descriptions);

  const handleDrop = (serviceId: number, descriptionId: number) => {
    const previouslyMatchedServiceIndex = servicesState.findIndex(
      (s) => s.matchedDescriptionId === descriptionId
    );

    setServicesState(prev => {
      const newState = [...prev];
      
      if (previouslyMatchedServiceIndex >= 0) {
        newState[previouslyMatchedServiceIndex].matchedDescriptionId = null;
      }
      
      const serviceIndex = newState.findIndex(s => s.id === serviceId);
      newState[serviceIndex].matchedDescriptionId = descriptionId;
      
      return newState;
    });

    setUnmatchedDescriptions(prev => prev.filter(d => d.id !== descriptionId));
  };

  const handleRemoveDescription = (descriptionId: number) => {
    setServicesState(prev => {
      const newState = [...prev];
      const serviceIndex = newState.findIndex(s => s.matchedDescriptionId === descriptionId);
      if (serviceIndex >= 0) {
        newState[serviceIndex].matchedDescriptionId = null;
      }
      return newState;
    });

    const description = descriptions.find(d => d.id === descriptionId);
    if (description) {
      setUnmatchedDescriptions(prev => [...prev, description]);
    }
  };

  const resetMatches = () => {
    setServicesState(services.map(service => ({ ...service, matchedDescriptionId: null })));
    setUnmatchedDescriptions(descriptions);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container}>
        <h1 className={styles.header}>Match Azure Services with Descriptions</h1>
        
        <div className={styles.columnsContainer}>
          <div className={styles.column}>
            <h2 className={styles.sectionHeader}>Azure Services</h2>
            {servicesState.map(service => {
              const matchedDescription = descriptions.find(
                d => d.id === service.matchedDescriptionId
              );
              return (
                <ServiceItem 
                  key={service.id}
                  service={service}
                  matchedDescription={matchedDescription || null}
                  onDrop={handleDrop}
                  onRemove={handleRemoveDescription}
                />
              );
            })}
          </div>

          <div className={styles.column}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className={styles.sectionHeader}>Descriptions</h2>
              <button 
                onClick={resetMatches}
                className={styles.resetButton}
              >
                Reset
              </button>
            </div>
            {unmatchedDescriptions.map(description => (
              <DraggableDescription key={description.id} description={description} />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}