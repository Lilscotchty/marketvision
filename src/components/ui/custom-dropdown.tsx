"use client";

import React from 'react';
import styled from 'styled-components';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface CustomDropdownMenuItem {
  icon: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  isDelete?: boolean;
  isSpecial?: boolean;
}

interface CustomDropdownProps {
  trigger: React.ReactNode;
  items: CustomDropdownMenuItem[][]; // Array of arrays for separated lists
}

const StyledWrapper = styled.div`
  .card {
    width: 200px;
    background-color: hsl(var(--popover));
    background-image: linear-gradient(
      139deg,
      hsl(var(--popover)) 0%,
      hsl(var(--popover)) 0%,
      hsl(259, 21%, 13%) 100%
    );
    border-radius: var(--radius);
    padding: 15px 0px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid hsl(var(--border));
  }

  .card .separator {
    border-top: 1.5px solid hsl(var(--border));
  }

  .card .list {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0px 10px;
    margin: 0;
  }

  .card .list .element {
    display: flex;
    align-items: center;
    color: hsl(var(--muted-foreground));
    gap: 10px;
    transition: all 0.3s ease-out;
    padding: 4px 7px;
    border-radius: 6px;
    cursor: pointer;
  }

  .card .list .element svg {
    width: 19px;
    height: 19px;
    stroke: hsl(var(--muted-foreground));
    transition: all 0.3s ease-out;
  }

  .card .list .element .label {
    font-weight: 600;
  }

  .card .list .element:hover {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    transform: translate(1px, -1px);
  }
  .card .list .delete:hover {
    background-color: hsl(var(--destructive));
  }
  
  .card .list .element:hover svg {
    stroke: hsl(var(--primary-foreground));
  }

  .card .list .element:active {
    transform: scale(0.99);
  }

  .card .list .special-item svg {
    stroke: hsl(var(--accent));
  }
  .card .list .special-item {
    color: hsl(var(--accent));
  }

  .card .list .special-item:hover {
    background-color: hsla(var(--accent) / 0.15);
  }
`;

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ trigger, items }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto p-0 border-none bg-transparent shadow-none">
        <StyledWrapper>
          <div className="card">
            {items.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                <ul className="list">
                  {group.map((item) => (
                    <li
                      key={item.label}
                      className={`element ${item.isDelete ? 'delete' : ''} ${item.isSpecial ? 'special-item' : ''}`}
                      onClick={item.onClick}
                    >
                      {item.icon}
                      <p className="label">{item.label}</p>
                    </li>
                  ))}
                </ul>
                {groupIndex < items.length - 1 && <div className="separator" />}
              </React.Fragment>
            ))}
          </div>
        </StyledWrapper>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
