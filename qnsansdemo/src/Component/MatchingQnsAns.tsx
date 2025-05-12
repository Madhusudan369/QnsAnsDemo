import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface Service {
  id: number;
  name: string;
  matchedDescriptionId: number | null;
}

interface Description {
  id: number;
  text: string;
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
  { id: 1, text: 'Securely store secrets and certificates' },
  { id: 2, text: 'Host and scale web applications' },
  { id: 3, text: 'Run virtualized operating systems' },
  { id: 4, text: 'Store unstructured data like images and videos' },
  { id: 5, text: 'Globally distributed, multi-model database service' },
  { id: 6, text: 'Event-driven serverless compute platform' },
  { id: 7, text: 'Enterprise-grade security for identities' },
];

const ServiceItem = ({
  service,
  matchedDescription,
  onDrop,
}: {
  service: Service;
  matchedDescription: Description | null;
  onDrop: (serviceId: number, descriptionId: number) => void;
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
      style={{
        backgroundColor: isOver ? '#f0f0f0' : 'white',
        padding: '12px',
        margin: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        minHeight: '60px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{service.name}</div>
      {matchedDescription && (
        <div style={{ 
          padding: '8px', 
          backgroundColor: '#e6f7ff',
          borderRadius: '4px',
          border: '1px dashed #1890ff'
        }}>
          {matchedDescription.text}
        </div>
      )}
    </div>
  );
};

const DraggableDescription = ({ description }: { description: Description }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'description',
    item: { id: description.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        padding: '8px',
        margin: '4px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#fafafa',
      }}
    >
      {description.text}
    </div>
  );
};

export default function MatchingQnsAns() {
  const [servicesState, setServicesState] = useState<Service[]>(services);
  const [unmatchedDescriptions, setUnmatchedDescriptions] = useState<Description[]>(descriptions);

  const handleDrop = (serviceId: number, descriptionId: number) => {
    // Check if this description is already matched to another service
    const previouslyMatchedServiceIndex = servicesState.findIndex(
      (s) => s.matchedDescriptionId === descriptionId
    );

    // Update services state
    setServicesState(prev => {
      const newState = [...prev];
      
      // Remove previous match if exists
      if (previouslyMatchedServiceIndex >= 0) {
        newState[previouslyMatchedServiceIndex].matchedDescriptionId = null;
      }
      
      // Set new match
      const serviceIndex = newState.findIndex(s => s.id === serviceId);
      newState[serviceIndex].matchedDescriptionId = descriptionId;
      
      return newState;
    });

    // Update unmatched descriptions
    setUnmatchedDescriptions(prev => prev.filter(d => d.id !== descriptionId));
  };

  const resetMatches = () => {
    setServicesState(services.map(service => ({ ...service, matchedDescriptionId: null })));
    setUnmatchedDescriptions(descriptions);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Match Azure Services with Descriptions</h1>
        
        <div style={{ display: 'flex', gap: '30px' }}>
          {/* Left Column - Services with drop targets */}
          <div style={{ flex: 1 }}>
            <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Azure Services</h2>
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
                />
              );
            })}
          </div>

          {/* Right Column - Descriptions to drag */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Descriptions</h2>
              <button 
                onClick={resetMatches}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
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