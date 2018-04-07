function play_music(sadness, joy, fear, disgust, anger, sentiment, lens);
    assert(length(lens) > 1);
    [pitches, durations] = generate_notes(sadness, joy, fear, disgust, anger, lens);
    lambda = sentiment + 1;
    f0 = 440; % frequency of A4
    fe = 44100; % sampling rate
    t = 0.5;
    p = 0.5;
    num_overtones = 3;
    tone_dim = fe * t;
    amps = zeros(num_overtones, 1);
    i = 0; % number of notes that have been picked at any moment
    music_wave = zeros(1, tone_dim * length(lens) * 8);
    b = 0; % beats passed
    mwl = length(music_wave);
    while i < length(lens)
        num_notes = poissrnd(lambda);
        for j = 1:num_notes
            if i >= length(lens)
                break
            end
            i = i + 1;
            num_beats = durations(i);
            fn = f0 * 2^(pitches(i) / 12);
            [y, ~] = calculsinus(fe, fn, t * num_beats, 1);
            overtones = zeros(num_overtones, tone_dim * num_beats);
            for k = 1:num_overtones
                [y1, ~] = calculsinus(fe, fn * (1 + k), t * num_beats, 1);
                overtones(k, :) = y1;
                amps(k) = 2^(-k);
            end
            % with overtones
            overtone_sum = sum(overtones .* repmat(amps, 1, tone_dim * num_beats));
            y = y + overtone_sum;
            [e] = env(fe, t * num_beats); % envelope
            y = y .* e;
            tone_wave = [zeros(1, b * tone_dim) y];
            tone_wave = [tone_wave zeros(1, mwl - length(tone_wave))];
            music_wave = music_wave + tone_wave;
        end
        b = b + 1;
    end
    music_wave = music_wave(1:find(music_wave,1,'last'));
    sound(music_wave, fe);
end

            

function [pitches, durations] = generate_notes(sadness, joy, fear, disgust, anger, lens)
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
end

function beats = beats(wl, anger)
    wl = min([wl 7]);
    beats = scale_int(wl^(anger + 1)/49, 1, 8);
end

function scaled = scale_int(real, lower, upper)
    assert(lower < upper);
    range = upper - lower;
    scaled = round(real * range + lower);
end

function gamme()
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