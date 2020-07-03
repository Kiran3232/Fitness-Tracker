import { Component, OnInit, OnDestroy } from '@angular/core';
import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {

  exercises: Exercise[] = [];
  exercisesSubscription: Subscription;

  constructor(
    private trainingService: TrainingService
  ) { }

  ngOnInit(): void {
    // this.exercises = this.firestore.collection('availableExercises').valueChanges();
    this.trainingService.fetchAvailableExercises();
    this.exercisesSubscription = this.trainingService.exercisesChanged.subscribe((exercises) => {
      this.exercises = exercises;
    })
  }

  ngOnDestroy(): void {
    this.exercisesSubscription.unsubscribe();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

}
