function [pitches, durations] = generate_notes(sadness, joy, fear, disgust, anger, sentiment, lens)
    assert(length(lens) > 1);
    min_pitch = scale_int(sadness, -16, -8);
    max_pitch = scale_int(fear, 8, 16);
    range = max_pitch - min_pitch + 1;
    max_step = scale_int(disgust, 1, 5);
    num_pitches = scale_int(joy, 3, range - 3);
    scale = sort(randperm(range, num_pitches)) + min_pitch - 1;
    pitches(1) = 0;
    last_pitch = 0;
    durations(1) = beats(lens(1), anger);
    for i = 2:length(lens)
        avail_pitches = scale((scale >= last_pitch - max_step) <= last_pitch + max_step);
        if avail_pitches(1) >= last_pitch & last_pitch > scale(1)
            avail_pitches = [find(scale < last_pitch, 1, 'last') avail_pitches];
        end
        if avail_pitches(end) <= last_pitch & last_pitch < scale(end)
            avail_pitches = [avail_pitches find(scale > last_pitch, 1)];
        end
        pitches(i) = datasample(avail_pitches, 1);
        durations(i) = beats(lens(i), anger);
    end
    pitches
    durations
end

function beats = beats(wl, anger)
    beats = scale_int(wl^(anger + 1)/49, 1, 8);
end

function scaled = scale_int(real, lower, upper)
    assert(lower < upper);
    range = upper - lower;
    scaled = round(real * range + lower);
end

function gamme()
    %frequence de note C
    f0 = 261.63;
    fn = f0;
    %frequence d'echantillonnage
    fe = 100000;
    t = 0.5;
    p = 0.5;
    n = 0;
    % 2 4 5 7 9 11 12
    %les notes de la chanson
    n = [-1 4 7 11 9 7 6 7 -8 -1 4 7 11 14 17 7 17 17 19 15 14 15 12 -7 7 7 12 15 19];
    i = 1;
    [r, c] = size(n);
    %determiner duree de chaque note et jouer
    while(i < c + 1)
        fn = f0 * 2^(n(i) / 12);
        i = i + 1;
        if i == 5 || i == 10 || i == 24
            t = 0.75;
            p = 1.25;
        elseif i == 12 || i == 13 || i == 14 || i == 15 || i == 21 || i == 22 || i == 26 || i == 27 || i == 28 || i == 29
            t = 0.25;
            p = 0.25;
        else
            t = 0.5;
            p = 0.5;
        end
        [y, ~] = calculsinus(fe, fn, t, 2);
        
        num_overtones = 4;
        overtone_dim = fe * t;
        overtones = zeros(num_overtones, overtone_dim);
        amps = zeros(num_overtones, 1);
        for j = 1:num_overtones
            [y1,~] = calculsinus(fe,fn * (1 + i), t, 2);
            overtones(i, :) = y1;
            amps(i) = 2^(-i);
        end
        %creer l'enveloppe
        [e] = env(fe, t);
        %jouer la note avec l'enveloppe
        %with overtones
        overtone_sum = sum(overtones .* repmat(amps, 1, overtone_dim));
        y = y + overtone_sum;
        sound(y .* e, fe);
        pause(p);
    end

end

%enveloppe pour chaque note
function e = env(fe,temp)
%Declaration des parametres
    t = linspace(0,temp,fe*temp);
    e = [];
    t1 = temp/4;
    t2 = temp*3/4;
    i=1;
    %recuperer le nombre d'echantillon de chaque note
    [m, n] = size(t);
    %definir les fonctions d'enveloppe pour chaque point echantillonage
    while(i<n+1)
        if t(1,i)<t1
            e = [e t(1,i)/t1];
        end
        if t(1,i)>t1 && t(1,i)<t2 
            e = [e 1];
        end
        if t(1,i)>t2
            e = [e 1-((t(1,i)-t2)/(temp-t2))];
        end
        i = i + 1;
    end
    plot(t,e);
end