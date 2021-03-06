import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TrainingService } from './training.service';
import { Exercise } from './exercise.model';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit {

  ongoingTraining = false;
  trainingSubscription: Subscription;
  pastExerciseSubscription: Subscription;
  countPastExercise: number;

  constructor(
    private trainingService: TrainingService
  ) { }

  ngOnInit(): void {
    this.trainingSubscription = this.trainingService.exerciseChanged.subscribe((exercise) => {
      if (exercise) {
        this.ongoingTraining = true;
      }
      else {
        this.ongoingTraining = false;
      }
    });
    this.pastExerciseSubscription = this.trainingService.pastExercisesChanged.subscribe((exercises: Exercise[]) => {
      this.countPastExercise = exercises.length;
    });
  }

}
