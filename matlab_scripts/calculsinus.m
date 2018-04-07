function [ y,t ] = calculsinus(fe,f0,temp,A);
%UNTITLED2 Summary of this function goes here
%   Detailed explanation goes here
    t = linspace(0,temp, fe*temp);
    y = A*sin(2*pi*f0*t);
end

