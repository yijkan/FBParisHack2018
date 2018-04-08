function music(posts)
    f0 = 440; % frequency of A4
    fe = 44100; % sampling rate
    t = 0.5;
    num_overtones = 4;
    tone_dim = fe * t;
    music_len = 0;
    [num_posts, ~] = size(posts);
    for p = 1:num_posts
        music_len = music_len + length(posts{p, 7});
    end
    music_wave = zeros(1, tone_dim * music_len * 8);
    mwl = length(music_wave);
    b = 0; % beats passed
    for p = 1:num_posts
        [sadness, joy, fear, disgust, anger, sentiment, lens] = posts{p,:};
        assert(length(lens) > 1);
        [pitches, durations] = generate_notes(sadness, joy, fear, disgust, anger, lens);
        lambda = (sentiment + 1) / 2;
        amps = zeros(num_overtones, 1);
        i = 0; % number of notes that have been picked at any moment
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
    end
    music_wave = music_wave(1:find(music_wave, 1, 'last'));
    music_wave = music_wave / max(abs(music_wave));
    % sound(music_wave, fe);
    audiowrite(strcat(datestr(datetime('now')), '.wav'), music_wave, fe);
end

            

function [pitches, durations] = generate_notes(sadness, joy, fear, disgust, anger, lens)
    min_pitch = scale_int(-sadness, -16, -8);
    max_pitch = scale_int(fear, 8, 16);
    range = max_pitch - min_pitch + 1;
    max_step = scale_int(disgust, 1, 5);
    num_pitches = scale_int(joy, 3, 12);
    scale = randperm(12, num_pitches); % in an octave
    scale = [scale - 24 scale - 12 scale scale + 12]; % spanning more octaves
    scale = sort(scale(scale <= max_pitch & scale >= min_pitch));
    pitches(1) = 0;
    last_pitch = 0;
    durations(1) = beats(lens(1), anger);
    for i = 2:length(lens)
        avail_pitches = scale(scale >= last_pitch - max_step & scale <= last_pitch + max_step);
        if length(avail_pitches) < 1 | avail_pitches(1) >= last_pitch & last_pitch > scale(1)
            avail_pitches = [find(scale < last_pitch, 1, 'last') avail_pitches];
        end
        if length(avail_pitches) < 1 | avail_pitches(end) <= last_pitch & last_pitch < scale(end)
            avail_pitches = [avail_pitches find(scale > last_pitch, 1)];
        end
        pitches(i) = datasample(avail_pitches, 1);
        last_pitch = pitches(i);
        durations(i) = beats(lens(i), anger);
    end
    pitches
end

function beats = beats(wl, anger)
    wl = min([wl 7]);
    beats = scale_int(wl^(anger + 1) / 49, 1, 12);
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